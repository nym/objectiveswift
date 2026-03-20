import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Mic, Square } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "~/lib/utils";

type RecorderState = "idle" | "recording" | "error";

export interface VoiceRecorderHandle {
  /** Programmatically start recording (used for auto-focus chaining between fields) */
  start: () => void;
}

export interface VoiceRecorderProps {
  /** Called with each final transcript segment, with any matched commands stripped out */
  onTranscript: (text: string) => void;
  /**
   * Voice commands to listen for. Each key is a phrase (matched case-insensitively);
   * the value is the callback to fire when that phrase is detected.
   * Any text before the command is passed to onTranscript first.
   * Recording stops after a command fires.
   *
   * @example
   * commands={{
   *   "next field": () => { nextRef.current?.focus(); nextRecorderRef.current?.start(); },
   *   "add objective": () => formRef.current?.requestSubmit(),
   * }}
   */
  commands?: Record<string, () => void>;
  /** Disable the button (e.g. during form submission) */
  disabled?: boolean;
  className?: string;
}

/**
 * Microphone button that uses the browser SpeechRecognition API for real-time
 * speech-to-text. Transcription happens locally in the browser — no server
 * round-trip, no API key required.
 *
 * - Hidden when SpeechRecognition is unavailable (Firefox, or non-HTTPS)
 * - Shows a pulsing red ring while recording
 * - Detects voice commands mid-sentence; emits text before the command, then fires it
 * - Exposes a start() handle via ref for programmatic chaining between fields
 */
export const VoiceRecorder = forwardRef<VoiceRecorderHandle, VoiceRecorderProps>(
  function VoiceRecorder({ onTranscript, commands, disabled = false, className }, ref) {
    const { t } = useTranslation();
    const [state, setState] = useState<RecorderState>("idle");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [supported, setSupported] = useState(false);
    const recognitionRef = useRef<SpeechRecognition | null>(null);

    // Keep callbacks in refs so recognition handlers always see the latest values
    const onTranscriptRef = useRef(onTranscript);
    const commandsRef = useRef(commands);
    useEffect(() => { onTranscriptRef.current = onTranscript; }, [onTranscript]);
    useEffect(() => { commandsRef.current = commands; }, [commands]);

    useEffect(() => {
      setSupported(
        typeof window !== "undefined" &&
          ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)
      );
    }, []);

    const startRecording = useCallback(() => {
      setErrorMessage(null);

      type WebkitWindow = Window & { webkitSpeechRecognition: typeof SpeechRecognition };
      const SpeechRecognitionImpl =
        (typeof SpeechRecognition !== "undefined" ? SpeechRecognition : null) ??
        (window as unknown as WebkitWindow).webkitSpeechRecognition;

      const recognition = new SpeechRecognitionImpl();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = navigator.language || "en-US";
      recognitionRef.current = recognition;

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (!event.results[i].isFinal) continue;

          const raw = event.results[i][0].transcript.trim();

          // Find the earliest command match in this utterance (word-boundary aware)
          let firstIdx = -1;
          let firstCallback: (() => void) | null = null;

          for (const [phrase, callback] of Object.entries(commandsRef.current ?? {})) {
            const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            const match = new RegExp(`\\b${escaped}\\b`, "i").exec(raw);
            if (match && (firstIdx === -1 || match.index < firstIdx)) {
              firstIdx = match.index;
              firstCallback = callback;
            }
          }

          if (firstIdx !== -1 && firstCallback) {
            const before = raw.slice(0, firstIdx).trim();
            if (before) onTranscriptRef.current(before);
            recognition.stop();
            firstCallback();
          } else {
            onTranscriptRef.current(raw);
          }
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        if (event.error === "not-allowed" || event.error === "service-not-allowed") {
          setErrorMessage(t("voiceRecorder.micPermissionDenied"));
        } else if (event.error !== "aborted") {
          setErrorMessage(t("voiceRecorder.recognitionError"));
        }
        setState("error");
        setTimeout(() => setState("idle"), 4000);
      };

      recognition.onend = () => {
        setState((prev) => (prev === "recording" ? "idle" : prev));
      };

      recognition.start();
      setState("recording");
    }, [t]);

    const stopRecording = useCallback(() => {
      recognitionRef.current?.stop();
    }, []);

    useImperativeHandle(ref, () => ({ start: startRecording }), [startRecording]);

    if (!supported) return null;

    const isRecording = state === "recording";
    const isError = state === "error";
    const isDisabled = disabled || isError;

    const handleClick = () => {
      if (isRecording) {
        stopRecording();
      } else if (!isDisabled) {
        startRecording();
      }
    };

    return (
      <div className="relative inline-flex">
        <button
          type="button"
          onClick={handleClick}
          disabled={isDisabled}
          aria-label={
            isRecording
              ? t("voiceRecorder.stopRecording")
              : t("voiceRecorder.startRecording")
          }
          aria-pressed={isRecording}
          className={cn(
            "h-7 w-7 rounded-full flex items-center justify-center transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#10b981]",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            isRecording
              ? "bg-red-500 text-white animate-pulse-ring"
              : isError
                ? "bg-red-100 text-red-500 dark:bg-red-900/30"
                : "text-gray-400 hover:text-[#10b981] hover:bg-[#d1fae5] dark:hover:bg-[#10b981]/10",
            className
          )}
        >
          {isRecording ? (
            <Square className="h-3 w-3 fill-current" />
          ) : (
            <Mic className="h-3.5 w-3.5" />
          )}
        </button>

        {isError && errorMessage && (
          <div
            role="alert"
            className="absolute bottom-full right-0 mb-1 w-48 rounded-md bg-red-50 dark:bg-red-900/40 border border-red-200 dark:border-red-700 px-2 py-1 text-xs text-red-600 dark:text-red-300 animate-fade-in"
          >
            {errorMessage}
          </div>
        )}
      </div>
    );
  }
);

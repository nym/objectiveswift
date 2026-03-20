import { useCallback, useEffect, useRef, useState } from "react";
import { useFetcher } from "react-router";
import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { ExpandingTextarea } from "~/components/ExpandingTextarea";
import { VoiceRecorder, type VoiceRecorderHandle } from "~/components/VoiceRecorder";

interface FieldErrors {
  title?: string[];
  description?: string[];
}

export function CreateObjectiveForm() {
  const { t } = useTranslation();
  const fetcher = useFetcher();
  const isSubmitting = fetcher.state !== "idle";

  const [titleError, setTitleError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const formRef = useRef<HTMLFormElement>(null);
  const descriptionRecorderRef = useRef<VoiceRecorderHandle>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);

  const errors: FieldErrors | undefined =
    fetcher.data && "errors" in fetcher.data
      ? (fetcher.data.errors as FieldErrors)
      : undefined;

  const serverTitleError = errors?.title?.[0];

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (!title.trim()) {
      e.preventDefault();
      setTitleError(t("objectives.form.titleRequired"));
      return;
    }
    setTitleError(null);
  };

  const handleSuccess = fetcher.data && "objective" in fetcher.data;

  // Clear form after each successful submission (depends on fetcher.data directly so
  // it re-fires on every new response, not just the first one)
  useEffect(() => {
    if (fetcher.data && "objective" in fetcher.data) {
      setTitle("");
      setDescription("");
      setTitleError(null);
    }
  }, [fetcher.data]);

  const handleTitleTranscript = useCallback((text: string) => {
    setTitle((prev) => (prev ? `${prev} ${text}` : text));
  }, []);

  const handleTitleNextField = useCallback(() => {
    descriptionRef.current?.focus();
    descriptionRecorderRef.current?.start();
  }, []);

  const handleVoiceSubmit = useCallback(() => {
    formRef.current?.requestSubmit();
  }, []);

  const handleDescriptionTranscript = useCallback((text: string) => {
    setDescription((prev) => (prev ? `${prev} ${text}` : text));
  }, []);

  return (
    <div className="bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        {t("objectives.form.heading")}
      </h2>

      {handleSuccess && (
        <p
          role="status"
          className="mb-4 text-sm text-[#10b981] animate-fade-in"
        >
          {t("objectives.form.success")}
        </p>
      )}

      <fetcher.Form
        ref={formRef}
        method="post"
        action="/objectives"
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        {/* Title */}
        <div className="space-y-1.5">
          <Label htmlFor="obj-title">{t("objectives.form.titleLabel")}</Label>
          <div className="relative">
            <Input
              id="obj-title"
              name="title"
              value={title}
              onChange={(e) => { setTitle(e.target.value); setTitleError(null); }}
              placeholder={t("objectives.form.titlePlaceholder")}
              aria-required="true"
              aria-describedby={
                titleError || serverTitleError ? "title-error" : undefined
              }
              aria-invalid={!!(titleError || serverTitleError)}
              autoComplete="off"
              className="pr-10"
            />
            <div className="absolute inset-y-0 right-2 flex items-center">
              <VoiceRecorder
                onTranscript={handleTitleTranscript}
                commands={{
                  "next field": handleTitleNextField,
                  "add objective": handleVoiceSubmit,
                }}
                disabled={isSubmitting}
              />
            </div>
          </div>
          {(titleError ?? serverTitleError) && (
            <p
              id="title-error"
              role="alert"
              className="text-xs text-[#ef4444] animate-fade-in"
            >
              {titleError ?? serverTitleError}
            </p>
          )}
        </div>

        {/* Description — ExpandingTextarea + VoiceRecorder */}
        <div className="space-y-1.5">
          <Label htmlFor="obj-description">
            {t("objectives.form.descriptionLabel")}
          </Label>
          <ExpandingTextarea
            ref={descriptionRef}
            id="obj-description"
            name="description"
            placeholder={t("objectives.form.descriptionPlaceholder")}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            aria-describedby="obj-description-hint"
            endAdornment={
              <VoiceRecorder
                ref={descriptionRecorderRef}
                onTranscript={handleDescriptionTranscript}
                commands={{ "add objective": handleVoiceSubmit }}
                disabled={isSubmitting}
              />
            }
          />
          <p
            id="obj-description-hint"
            className="text-xs text-gray-400 dark:text-gray-500"
          >
            {t("objectives.form.descriptionHint")}
          </p>
        </div>

        <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {t("objectives.form.submitting")}
            </>
          ) : (
            t("objectives.form.submit")
          )}
        </Button>
      </fetcher.Form>
    </div>
  );
}

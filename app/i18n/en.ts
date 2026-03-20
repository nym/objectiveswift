export default {
  common: {
    appName: "Objective Swift",
    description: "A focused, voice-first objective tracker.",
    description2: "Capture objectives quickly by keyboard or voice, move them through a simple active → complete → deleted lifecycle",
    toggleTheme: "Toggle theme",
  },
  home: {
    description: ", and trust they're stored safely — with the interface staying out of your way.",
    viewDemo: "View Demo",
  },
  errors: {
    oops: "Oops!",
    unexpected: "An unexpected error occurred.",
    notFound: "404",
    error: "Error",
    pageNotFound: "The requested page could not be found.",
  },
  objectives: {
    title: "Objectives",
    metaDescription: "Track and manage your objectives",
    createSection: "Create a new objective",
    listSection: "Your objectives",
    form: {
      heading: "New objective",
      titleLabel: "Title",
      titlePlaceholder: "What do you want to achieve?",
      titleRequired: "Title is required",
      descriptionLabel: "Description",
      descriptionPlaceholder: "Add details, notes, or dictate with your voice…",
      descriptionHint: "Tap the mic to dictate. The field grows as you type.",
      submit: "Add objective",
      submitting: "Adding…",
      success: "Objective added!",
    },
    list: {
      heading: "All objectives",
      empty: "No objectives yet. Add your first one above. If you want, you can even use your voice to add it! Use the keyword 'next field' to jump to the description. Say 'add objective' once done dictating your objective to save.",
      delete: "Delete objective",
      confirmDelete: "Delete?",
    },
  },
  voiceRecorder: {
    startRecording: "Start voice recording",
    stopRecording: "Stop recording",
    micPermissionDenied: "Microphone access denied.",
    recognitionError: "Speech recognition failed. Try again.",
  },
} as const;

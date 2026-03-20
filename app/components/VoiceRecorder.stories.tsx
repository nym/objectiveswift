import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { VoiceRecorder } from "./VoiceRecorder";
import { ExpandingTextarea } from "./ExpandingTextarea";

const meta = {
  title: "Components/VoiceRecorder",
  component: VoiceRecorder,
  parameters: { layout: "padded" },
  args: {
    onTranscript: (text: string) => console.log("transcript:", text),
  },
} satisfies Meta<typeof VoiceRecorder>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Disabled: Story = {
  args: { disabled: true },
};

/** Shows the recorder embedded inside an ExpandingTextarea as used in production */
export const InsideTextarea: Story = {
  render: () => {
    const [value, setValue] = useState("");
    return (
      <div className="max-w-md space-y-1.5">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Description
        </label>
        <ExpandingTextarea
          placeholder="Add details, notes, or dictate with your voice…"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          endAdornment={
            <VoiceRecorder
              onTranscript={(text) =>
                setValue((prev) => (prev ? `${prev} ${text}` : text))
              }
            />
          }
        />
        <p className="text-xs text-gray-400 dark:text-gray-500">
          Tap the mic to dictate. The field grows as you type.
        </p>
      </div>
    );
  },
};

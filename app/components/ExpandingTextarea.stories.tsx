import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { ExpandingTextarea } from "./ExpandingTextarea";

const meta = {
  title: "Components/ExpandingTextarea",
  component: ExpandingTextarea,
  parameters: { layout: "padded" },
  args: {
    placeholder: "Add details, notes, or dictate with your voice…",
  },
} satisfies Meta<typeof ExpandingTextarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

export const WithContent: Story = {
  args: {
    value:
      "This is a pre-filled description that spans a couple of lines to show how the textarea looks with some content already in it.",
    onChange: () => {},
  },
};

export const LongContent: Story = {
  args: {
    value: Array(12)
      .fill("Each morning I will write three pages of stream-of-consciousness.")
      .join("\n"),
    onChange: () => {},
  },
};

export const Controlled: Story = {
  render: (args) => {
    const [value, setValue] = useState("");
    return (
      <div className="space-y-2">
        <ExpandingTextarea
          {...args}
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <p className="text-xs text-gray-400">{value.length} characters</p>
      </div>
    );
  },
};

export const Disabled: Story = {
  args: {
    value: "This field is disabled.",
    disabled: true,
    onChange: () => {},
  },
};

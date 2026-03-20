import type { Meta, StoryObj } from "@storybook/react";
import { CreateObjectiveForm } from "./CreateObjectiveForm";

const meta = {
  title: "Components/CreateObjectiveForm",
  component: CreateObjectiveForm,
  parameters: { layout: "padded" },
} satisfies Meta<typeof CreateObjectiveForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

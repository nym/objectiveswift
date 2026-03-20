import type { Meta, StoryObj } from "@storybook/react";
import { ObjectiveList } from "./ObjectiveList";

const now = new Date("2026-03-19T09:00:00Z");
const yesterday = new Date("2026-03-18T14:30:00Z");
const lastWeek = new Date("2026-03-12T08:15:00Z");

const sampleObjectives = [
  {
    id: "1",
    title: "Run 5k every morning",
    description:
      "Start at 6am before work. Build up from 2k this week. Track pace with the watch.",
    createdAt: now,
    updatedAt: now,
    completedAt: null,
  },
  {
    id: "2",
    title: "Read 20 pages daily",
    description: null,
    createdAt: yesterday,
    updatedAt: yesterday,
    completedAt: null,
  },
  {
    id: "3",
    title: "Learn TypeScript generics",
    description:
      "Focus on conditional types, mapped types, and template literal types. Work through the handbook chapter by chapter.",
    createdAt: lastWeek,
    updatedAt: lastWeek,
    completedAt: null,
  },
  {
    id: "4",
    title: "Meditate for 10 minutes before bed",
    description: null,
    createdAt: lastWeek,
    updatedAt: lastWeek,
    completedAt: null,
  },
];

const meta = {
  title: "Components/ObjectiveList",
  component: ObjectiveList,
  parameters: { layout: "padded" },
} satisfies Meta<typeof ObjectiveList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithObjectives: Story = {
  args: { objectives: sampleObjectives },
};

export const SingleObjective: Story = {
  args: { objectives: [sampleObjectives[0]] },
};

export const Empty: Story = {
  args: { objectives: [] },
};

export const LongDescription: Story = {
  args: {
    objectives: [
      {
        id: "5",
        title: "Write morning pages",
        description: Array(10)
          .fill(
            "Each morning write three pages of stream-of-consciousness longhand. Do not edit, do not judge."
          )
          .join(" "),
        createdAt: now,
        updatedAt: now,
        completedAt: null,
      },
    ],
  },
};

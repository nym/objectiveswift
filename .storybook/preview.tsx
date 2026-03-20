import React from "react";
import type { Preview } from "@storybook/react";
import { MemoryRouter } from "react-router";
import { I18nextProvider } from "react-i18next";
import i18n from "../app/i18n";
import "../app/app.css";

const preview: Preview = {
  decorators: [
    (Story) => (
      <MemoryRouter>
        <I18nextProvider i18n={i18n}>
          <Story />
        </I18nextProvider>
      </MemoryRouter>
    ),
  ],
  parameters: {
    backgrounds: {
      default: "light",
      values: [
        { name: "light", value: "#ffffff" },
        { name: "dark", value: "#030712" },
      ],
    },
  },
};

export default preview;

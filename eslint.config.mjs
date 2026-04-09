import { FlatCompat } from "@eslint/eslintrc";
import { dirname } from "path";
import { fileURLToPath } from "url";

const currentFilePath = fileURLToPath(import.meta.url);
const currentDirectory = dirname(currentFilePath);

const compat = new FlatCompat({
  baseDirectory: currentDirectory,
});

const config = [
  {
    ignores: [
      ".next/**",
      "generated/**",
      "coverage/**",
    ],
  },
  ...compat.extends("next/core-web-vitals"),
  {
    rules: {
      // A meglévő klienskomponensek több helyen tudatosan effectből frissítenek lokális UI state-et.
      // Ezek most nem viselkedési hibák, ezért a Next 16-tal érkező új szabályt itt kikapcsoljuk.
      "react-hooks/set-state-in-effect": "off",
      "import/no-anonymous-default-export": "off",
    },
  },
];

export default config;

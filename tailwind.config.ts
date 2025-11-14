import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        argocd: {
          primary: '#4A90E2',
          success: '#00C853',
          warning: '#FFC107',
          error: '#F44336',
          degraded: '#FF9800',
          progressing: '#2196F3',
        }
      },
    },
  },
  plugins: [],
};

export default config;

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Roboto', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Material You – flat keys so Tailwind resolves them unambiguously
        "m3-primary":                "#4F46E5",
        "m3-on-primary":             "#FFFFFF",
        "m3-primary-container":      "#E0E7FF",
        "m3-on-primary-container":   "#1E1578",
        "m3-surface":                "#FFFBFE",
        "m3-surface-container":      "#F3EDF7",
        "m3-surface-container-high": "#ECE6F0",
        "m3-on-surface":             "#1C1B1F",
        "m3-on-surface-variant":     "#49454F",
        "m3-outline":                "#79747E",
        "m3-outline-variant":        "#CAC4D0",
      },
      borderRadius: {
        xl2: "20px",
        xl3: "28px",
      },
    },
  },
  plugins: [],
};

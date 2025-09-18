import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  safelist: [
    // Ranking badge colors - light theme
    'bg-red-100', 'text-red-800', 'border-red-300',
    'bg-orange-100', 'text-orange-800', 'border-orange-300',
    'bg-yellow-100', 'text-yellow-800', 'border-yellow-300',
    'bg-blue-100', 'text-blue-800', 'border-blue-300',
    'bg-purple-100', 'text-purple-800', 'border-purple-300',
    'bg-gray-100', 'text-gray-800', 'border-gray-300',
    // Ranking badge colors - dark theme
    'dark:bg-red-900/50', 'dark:text-red-300', 'dark:border-red-700',
    'dark:bg-orange-900/50', 'dark:text-orange-300', 'dark:border-orange-700',
    'dark:bg-yellow-900/50', 'dark:text-yellow-300', 'dark:border-yellow-700',
    'dark:bg-blue-900/50', 'dark:text-blue-300', 'dark:border-blue-700',
    'dark:bg-purple-900/50', 'dark:text-purple-300', 'dark:border-purple-700',
    'dark:bg-gray-800/50', 'dark:text-gray-300', 'dark:border-gray-700',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Evergreen brand colors
        evergreen: {
          dark: "#373A36",
          "light-green": "#A2D45E",
          cyan: "#1DCAD3",
          green: "#00B451",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config

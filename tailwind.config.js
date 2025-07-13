// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      fontSize: {
        xs: "0.65rem", // Smaller than Tailwind's default (0.75rem)
        sm: "0.75rem",
        base: "0.85rem",
        lg: "1rem",
        xl: "1.125rem",
      },
    },
  },
  plugins: [require("daisyui")],
};

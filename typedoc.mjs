/** @type {Partial<import("typedoc").TypeDocOptions>} */
const config = {
  entryPoints: ["./src/**"],
  entryPointStrategy: "Expand",
  out: "./docs",

  plugin: ["typedoc-material-theme", "typedoc-plugin-inline-sources"],

  darkHighlightTheme: "catppuccin-macchiato",
  lightHighlightTheme: "catppuccin-latte",

  themeColor: "#1D2021",

  name: "Ciorent",
  readme: "./lib/README.md",

  skipErrorChecking: true,
};

export default config;

/** @type {Partial<import("typedoc").TypeDocOptions>} */
const config = {
  entryPoints: ["./src/**"],
  entryPointStrategy: "Expand",
  out: "./docs",

  plugin: ["typedoc-material-theme", "typedoc-plugin-inline-sources"],

  darkHighlightTheme: "catppuccin-mocha",
  lightHighlightTheme: "catppuccin-latte",

  name: "Ciorent",
  readme: "./lib/README.md",

  skipErrorChecking: true,
};

export default config;

const config: UXPilotConfig = {
  output: {
    html: "output/htmls",
    json: "output/json",
  },
  paths: {
    computeHtmlStyles: "../",
    figmaPlugin: "../uxpilot-figma-plugin",
  },
  options: {
    deviceType: "desktop",
    autoWriteToPlugin: true,
    headlessBrowser: true,
  },
};

export default config;

/**
 * Configuration interface for the UXPilot HTML processor
 *
 * This interface defines the structure and types for all configuration options
 * used throughout the application. It provides type safety and clear documentation
 * for developers and users customizing the tool.
 */
interface UXPilotConfig {
  /**
   * Output directory configuration
   *
   * Defines where generated HTML and JSON files will be saved.
   * Paths are relative to the root folder root.
   */
  output: {
    /**
     * Directory path for saving HTML files
     *
     * @example "output/htmls" - saves to <root>/output/htmls/
     * @example "my-html-files" - saves to <root>/my-html-files/
     * @example "../generated-html" - saves to parent directory
     */
    html: string;

    /**
     * Directory path for saving JSON files
     *
     * @example "output/json" - saves to <root>/output/json/
     * @example "my-json-files" - saves to <root>/my-json-files/
     * @example "../generated-json" - saves to parent directory
     */
    json: string;
  };

  /**
   * External repository paths
   *
   * Defines the locations of related repositories that the tool needs to access.
   * All paths are relative to the root folder for cross-platform compatibility.
   */
  paths: {
    /**
     * Path to the computeHtmlStyles repository
     *
     * This repository contains the core HTML processing utilities.
     * The tool will look for htmlToJsonUtils-dev.js in this location.
     *
     * @example "../" - parent directory (default)
     * @example "../../computeHtmlStyles" - two levels up, then into repo
     * @example "./computeHtmlStyles" - subdirectory of scripto folder
     */
    computeHtmlStyles: string;

    /**
     * Path to the Figma plugin repository
     *
     * When autoWriteToPlugin is enabled, generated JSON will be written
     * to preview-html.json in this repository.
     *
     * @example "../uxpilot-figma-plugin" - parent directory, then into repo (default)
     * @example "../../my-figma-plugin" - two levels up, then into repo
     * @example "./plugin" - subdirectory of scripto folder
     */
    figmaPlugin: string;
  };

  /**
   * Processing behavior options
   *
   * Controls how the tool processes HTML and handles output.
   */
  options: {
    /**
     * Target device type for responsive design processing used by computeHtmlStyles
     *
     * @example "desktop" - processes for desktop viewport (default)
     * @example "mobile" - processes for mobile viewport
     */
    deviceType: "desktop" | "mobile";

    /**
     * Whether to automatically write JSON output to the Figma plugin repository
     *
     * When enabled, the tool will automatically copy the generated JSON
     * to preview-html.json in the configured figmaPlugin path.
     *
     * @example true - automatically write to plugin repo (default)
     * @example false - only save to local output directory
     */
    autoWriteToPlugin: boolean;

    /**
     * Whether to run the browser in headless mode (does not affect computeHtmlStyles)
     *
     * @example true - run the browser in headless mode (default)
     * @example false - run the browser in non-headless mode
     */
    headlessBrowser: boolean;
  };
}

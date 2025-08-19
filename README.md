# uxpilot-extractor

A CLI tool for extracting and processing UXPilot design HTML content. This tool fetches UXPilot design URLs, extracts HTML from iframes, processes the HTML using computeHtmlStyles, and outputs both HTML and JSON files for further use in Figma plugins or other applications.

## Features

- 🎨 **UXPilot Design Extraction**: Fetch HTML content from UXPilot design URLs
- 🔍 **HTML Processing**: Process HTML with computeHtmlStyles to generate computed styles JSON
- 📁 **Multiple Output Formats**: Generate both HTML and timestamped JSON files
- 📋 **Design Management**: List and organize all extracted designs with detailed file information
- 🔌 **Figma Plugin Integration**: Automatically write JSON to plugin repository
- 🌐 **Browser Automation**: Uses Playwright for reliable web scraping
- ⚡ **Fast & Efficient**: Built with Bun for optimal performance

## What It Does

This tool is designed to bridge the gap between UXPilot designs and development workflows. It:

1. Takes a UXPilot design URL as input
2. Launches a headless browser to fetch the design content
3. Extracts HTML from the design iframe
4. Processes the HTML using computeHtmlStyles to generate computed styles
5. Outputs both the raw HTML and processed JSON files
6. Optionally writes the JSON to a Figma plugin repository
7. Provides tools to manage and organize extracted designs

## Installation

```bash
bun install
```

## Usage

### Basic Usage

```bash
bun start
```

The tool will prompt you to enter a UXPilot design URL and then process it automatically.

### List Extracted Designs

To view all previously extracted designs and their files:

```bash
bun run list-designs
```

This command scans the output directories and displays:
- All unique designs that have been extracted
- Number of extractions per design
- File sizes and timestamps for both HTML and JSON files
- Missing files (if HTML or JSON is incomplete)

### Clear Outputs

To clear generated output files:

```bash
bun run clear-outputs
```

## Configuration

The tool uses a configuration file (`config.ts`) to manage:
- Output directories for HTML and JSON files
- Paths to computeHtmlStyles and Figma plugin repositories
- Browser options (headless mode, device type)
- Auto-write to plugin repository settings

## Output

The tool generates two main output files:
- **HTML file**: Raw HTML content from the UXPilot design
- **JSON file**: Computed styles processed through computeHtmlStyles

Files are automatically named with timestamps and design identifiers for easy organization.

## Dependencies

- **Bun**: Fast JavaScript runtime and package manager
- **Playwright**: Browser automation for web scraping
- **computeHtmlStyles**: HTML to JSON styles processing
- **TypeScript**: Type-safe development

## Development

This project was created using `bun init` in bun v1.2.10. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.

## License

Private - This is a private project.

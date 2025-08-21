import { createConsola } from "consola";
import { readdir, stat, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import config from "config";
import chalk from "chalk";
import prettyBytes from "pretty-bytes";
import { format, parse } from "date-fns";

const consola = createConsola({
  formatOptions: {
    date: false,
  },
});

interface DesignFile {
  name: string;
  path: string;
  size: number;
  modified: Date;
  type: "html" | "json";
  designSlug: string;
  timestamp: string;
}

async function getDesignFiles(): Promise<DesignFile[]> {
  const htmlDir = path.resolve(config.output.html);
  const jsonDir = path.resolve(config.output.json);

  const files: DesignFile[] = [];

  try {
    // Ensure directories exist
    if (!existsSync(htmlDir)) {
      await mkdir(htmlDir, { recursive: true });
      consola.info(`Created HTML output directory: ${htmlDir}`);
    }

    if (!existsSync(jsonDir)) {
      await mkdir(jsonDir, { recursive: true });
      consola.info(`Created JSON output directory: ${jsonDir}`);
    }

    // Get HTML files
    const htmlFiles = await readdir(htmlDir);

    for (const file of htmlFiles) {
      if (file.endsWith(".html")) {
        const filePath = path.join(htmlDir, file);
        const stats = await stat(filePath);
        const parsed = parseFileName(file);

        files.push({
          name: file,
          path: filePath,
          size: stats.size,
          modified: stats.mtime,
          type: "html",
          designSlug: parsed.designSlug,
          timestamp: parsed.timestamp,
        });
      }
    }

    // Get JSON files
    const jsonFiles = await readdir(jsonDir);
    for (const file of jsonFiles) {
      if (file.endsWith(".json")) {
        const filePath = path.join(jsonDir, file);
        const stats = await stat(filePath);
        const parsed = parseFileName(file);

        files.push({
          name: file,
          path: filePath,
          size: stats.size,
          modified: stats.mtime,
          type: "json",
          designSlug: parsed.designSlug,
          timestamp: parsed.timestamp,
        });
      }
    }
  } catch (error) {
    consola.error("Error reading output directories:", error);
    return [];
  }

  return files;
}

function parseFileName(filename: string): {
  designSlug: string;
  timestamp: string;
} {
  // Expected format: uxpilot-{designSlug}-{timestamp}.{ext}
  // Timestamp format: yyyy-MM-dd_HH-mm-ss
  const match = filename.match(
    /uxpilot-(.+)-(\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2})\.(html|json)/
  );

  if (match && match[1] && match[2]) {
    return {
      designSlug: match[1],
      timestamp: match[2],
    };
  }
  return {
    designSlug: "unknown",
    timestamp: "unknown",
  };
}

function groupByDesign(files: DesignFile[]): Map<string, DesignFile[]> {
  const groups = new Map<string, DesignFile[]>();

  for (const file of files) {
    if (!groups.has(file.designSlug)) {
      groups.set(file.designSlug, []);
    }

    const group = groups.get(file.designSlug)!;
    group.push(file);
  }

  return groups;
}

function formatTable(groups: Map<string, DesignFile[]>): void {
  if (groups.size === 0) {
    consola.info("No extracted designs found.");
    return;
  }

  consola.box(`Found ${groups.size} unique design(s)`);

  // Sort by most recent extraction first
  const sortedGroups = Array.from(groups.entries()).sort((a, b) => {
    const aLatest = Math.max(...a[1].map((f) => f.modified.getTime()));
    const bLatest = Math.max(...b[1].map((f) => f.modified.getTime()));
    return bLatest - aLatest;
  });

  for (const [designSlug, files] of sortedGroups) {
    // Sort files by timestamp (newest first)
    const sortedFiles = files.sort((a, b) => {
      const aTime = a.timestamp;
      const bTime = b.timestamp;
      return bTime.localeCompare(aTime);
    });

    // Group files by timestamp to count unique extractions
    const uniqueTimestamps = new Set(files.map((f) => f.timestamp));
    const extractionCount = uniqueTimestamps.size;

    consola.log("\n" + chalk.cyan.bold(`📁 Design: ${designSlug}`));
    consola.log(chalk.dim(`   Total extractions: ${extractionCount}`));

    // Group files by timestamp
    const filesByTimestamp = new Map<
      string,
      { html?: DesignFile; json?: DesignFile }
    >();
    for (const file of sortedFiles) {
      if (!filesByTimestamp.has(file.timestamp)) {
        filesByTimestamp.set(file.timestamp, {});
      }
      const group = filesByTimestamp.get(file.timestamp)!;
      if (file.type === "html") {
        group.html = file;
      } else {
        group.json = file;
      }
    }

    // Display each extraction
    for (const [timestamp, group] of filesByTimestamp) {
      const html = group.html;
      const json = group.json;

      // Parse timestamp for display using date-fns
      let displayTime = "Unknown";
      try {
        if (timestamp !== "unknown") {
          // Parse format: yyyy-MM-dd_HH-mm-ss using date-fns
          const parsedDate = parse(
            timestamp,
            "yyyy-MM-dd_HH-mm-ss",
            new Date()
          );
          displayTime = format(parsedDate, "MMM dd, yyyy h:mm aaa");
        }
      } catch (error) {
        displayTime = "Invalid date";
      }

      consola.log(chalk.dim(`   └─ ${displayTime}`));

      if (html) {
        const relativePath = path.relative(process.cwd(), html.path);
        consola.log(
          chalk.green(`      ✅ HTML: `) +
            chalk.cyan(relativePath) +
            chalk.green(` (${prettyBytes(html.size)})`)
        );
      }

      if (json) {
        const relativePath = path.relative(process.cwd(), json.path);
        consola.log(
          chalk.blue(`      📊 JSON: `) +
            chalk.cyan(relativePath) +
            chalk.blue(` (${prettyBytes(json.size)})`)
        );
      }

      if (!html || !json) {
        consola.log(
          chalk.yellow(`      ⚠️  Missing ${!html ? "HTML" : "JSON"} file`)
        );
      }
    }
  }

  consola.log("\n" + chalk.dim('Use "bun run clear-outputs" to delete all outputs'));
}

async function main() {
  consola.start("Scanning for extracted designs...");

  const files = await getDesignFiles();
  const groups = groupByDesign(files);

  if (files.length === 0) {
    consola.info("No extracted designs found yet.");
    consola.info("Run the extraction process first to generate HTML and JSON files.");
    return;
  }

  formatTable(groups);
}

if (import.meta.main) {
  main().catch((error) => {
    consola.error("Failed to list designs:", error);
    process.exit(1);
  });
}

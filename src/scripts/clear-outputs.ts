import config from "config";
import consola from "consola";
import { rm } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

const htmlOutputDir = path.resolve(config.output.html);
const jsonOutputDir = path.resolve(config.output.json);

// Check if directories exist
const htmlExists = existsSync(htmlOutputDir);
const jsonExists = existsSync(jsonOutputDir);

if (!htmlExists && !jsonExists) {
  consola.info("No output directories found to clear.");
  process.exit(0);
}

consola.warn("The following directories will be permanently deleted:");
if (htmlExists) consola.info(htmlOutputDir);
if (jsonExists) consola.info(jsonOutputDir);

const confirm = await consola.prompt(
  "Are you sure you want to continue? (y/n)",
  {
    type: "confirm",
  }
);

if (!confirm) {
  consola.success("Cancelled");
  process.exit(0);
}

// Delete directories only if they exist
if (htmlExists) {
  await rm(htmlOutputDir, { recursive: true, force: true });
  consola.success("HTML output directory cleared");
}

if (jsonExists) {
  await rm(jsonOutputDir, { recursive: true, force: true });
  consola.success("JSON output directory cleared");
}

consola.success("Outputs cleared");

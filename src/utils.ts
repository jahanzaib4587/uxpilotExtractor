import config from "config";
import { mkdir } from "fs/promises";
import path from "path";
import { format } from "date-fns";

export function isValidUrl(url: string) {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
}

export function isValidUxPilotUrl(url: string) {
  const isValid = isValidUrl(url);

  if (!isValid) return false;

  return url.includes("uxpilot.ai");
}

export async function createOutputDirs() {
  const htmlOutputDirectory = path.resolve(config.output.html);
  const jsonOutputDirectory = path.resolve(config.output.json);

  await mkdir(htmlOutputDirectory, { recursive: true });
  await mkdir(jsonOutputDirectory, { recursive: true });
}

export function generateOutputFilePaths(uxPilotUrl: string) {
  const parsedUrl = new URL(uxPilotUrl);
  const pathSegments = parsedUrl.pathname.split("/").filter(Boolean);
  const designSlug = pathSegments.pop() || "design";

  // Format: yyyy-MM-dd_HH-mm-ss (ISO-like format that sorts correctly)
  const formattedTimestamp = format(new Date(), "yyyy-MM-dd_HH-mm-ss");

  const htmlOutputDirectory = path.join(config.output.html);
  const jsonOutputDirectory = path.join(config.output.json);

  const htmlFileName = `uxpilot-${designSlug}-${formattedTimestamp}.html`;
  const jsonFileName = `uxpilot-${designSlug}-${formattedTimestamp}.json`;

  return [
    path.join(htmlOutputDirectory, htmlFileName),
    path.join(jsonOutputDirectory, jsonFileName),
  ] as const;
}

export async function processHtmlWithComputeHtmlStyles(html: string) {
  const htmlToJsonUtilsPath = path.resolve(
    config.paths.computeHtmlStyles,
    "htmlToJsonUtils-dev.js"
  );
  const { computeStyles } = await import(htmlToJsonUtilsPath);

  const { computedStyles } = await computeStyles(
    html,
    config.options.deviceType
  );

  return JSON.stringify(computedStyles, null, 2);
}

export async function writeJsonToPluginRepo(json: string) {
  const pluginJsonOutputPath = path.resolve(
    config.paths.figmaPlugin,
    "preview-html.json"
  );

  const bytesWritten = await Bun.write(pluginJsonOutputPath, json);

  return [pluginJsonOutputPath, bytesWritten] as const;
}

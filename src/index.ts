import consola from "consola";
import { chromium } from "playwright";
import { unescapeHTML } from "fast-escape-html";
import prettyBytes from "pretty-bytes";
import {
  isValidUxPilotUrl,
  generateOutputFilePaths,
  createOutputDirs,
  processHtmlWithComputeHtmlStyles,
  writeJsonToPluginRepo,
} from "@/utils";
import yoctoSpinner from "yocto-spinner";
import config from "config";
import chalk from "chalk";

const spinner = yoctoSpinner();

const uxPilotUrl = await consola.prompt(
  "Please enter the UXPilot design URL: ",
  {
    type: "text",
    placeholder: "https://uxpilot.ai/s/<design-id>",
  }
);

if (!isValidUxPilotUrl(uxPilotUrl)) {
  consola.error("Invalid UXPilot design URL");
  process.exit(1);
}

consola.start(" Fetching UXPilot design...");

const browser = await chromium.launch({
  headless: config.options.headlessBrowser,
});
const context = await browser.newContext();
const page = await context.newPage();

consola.log("🌐 Browser launched");

await page.goto(uxPilotUrl, { waitUntil: "domcontentloaded" });

consola.log("📄 Page loaded, waiting for iframe to load...");

await page.locator("iframe[srcdoc]").waitFor();

consola.log("🖼️  Iframe loaded, getting srcdoc...");

const iframe = page.locator("iframe[srcdoc]");
const srcdoc = await iframe.getAttribute("srcdoc");

if (!srcdoc) {
  consola.error("❌ No srcdoc attribute found on iframe. Exiting...");
  await browser.close();
  process.exit(1);
}

consola.log("🔍 srcdoc found, closing browser and unescaping HTML entities...");

await browser.close();

const unescapedHtml = unescapeHTML(srcdoc);

spinner.start(" Computing styles JSON (using computeHtmlStyles)...");

const computedStylesJson = await processHtmlWithComputeHtmlStyles(
  unescapedHtml
);

spinner.success(" Styles Computed!");

await createOutputDirs();

const [htmlOutputPath, jsonOutputPath] = generateOutputFilePaths(uxPilotUrl);

consola.log("💾 Writing to files...");

const htmlWritePromise = Bun.write(htmlOutputPath, unescapedHtml);
const jsonWritePromise = Bun.write(jsonOutputPath, computedStylesJson);

const [htmlWriteBytes, jsonWriteBytes] = await Promise.all([
  htmlWritePromise,
  jsonWritePromise,
]);

if (config.options.autoWriteToPlugin) {
  writeJsonToPluginRepo(computedStylesJson).then(
    ([pluginJsonOutputPath, bytesWritten]) => {
      consola.log(
        chalk.dim(
          `JSON written to plugin repo: ${pluginJsonOutputPath} (${prettyBytes(
            bytesWritten
          )})`
        )
      );
    }
  );
}

consola.box(`✅ UXPilot design fetched and saved`);
consola.info(`HTML: ${htmlOutputPath} (${prettyBytes(htmlWriteBytes)})`);
consola.info(`JSON: ${jsonOutputPath} (${prettyBytes(jsonWriteBytes)})`);

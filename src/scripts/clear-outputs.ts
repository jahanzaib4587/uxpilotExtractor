import config from "config";
import consola from "consola";
import { rm } from "fs/promises";
import path from "path";

const htmlOutputDir = path.resolve(config.output.html);
const jsonOutputDir = path.resolve(config.output.json);

consola.warn("The following directories will be permanently deleted:");
consola.info(htmlOutputDir);
consola.info(jsonOutputDir);

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

await rm(htmlOutputDir, { recursive: true, force: true });
await rm(jsonOutputDir, { recursive: true, force: true });

consola.success("Outputs cleared");

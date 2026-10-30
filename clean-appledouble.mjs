import { readdir, rm, stat } from "node:fs/promises";
import { join, resolve } from "node:path";

const targets = process.argv.slice(2);
const roots = targets.length > 0 ? targets : ["."];
const ignoredDirectories = new Set([
  ".git",
  "node_modules",
  "coverage"
]);

async function cleanAppleDouble(directory) {
  let entries;

  try {
    entries = await readdir(directory);
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      return;
    }

    throw error;
  }

  await Promise.all(entries.map(async (entry) => {
    const path = join(directory, entry);

    if (ignoredDirectories.has(entry)) {
      return;
    }

    if (entry.startsWith("._")) {
      await rm(path, { force: true, recursive: true });
      return;
    }

    const info = await stat(path);
    if (info.isDirectory()) {
      await cleanAppleDouble(path);
    }
  }));
}

await Promise.all(roots.map((root) => cleanAppleDouble(resolve(root))));

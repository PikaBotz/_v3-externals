// "for:anya.v3"

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Scrapes TikPorn video URLs and file sizes silently.
 * @param {Object} options Configuration options
 * @param {number|string} [options.page="random"] Specific page number or "random"
 * @param {number} [options.limit=1] Number of video pages to parse
 * @returns {Promise<Array<{size: string, url: string}>>} Array of size and url objects
 */
export async function getTikPornVideos(options = {}) {
  const { page = "random", limit = 1 } = options;

  return new Promise((resolve) => {
    const scriptPath = path.join(__dirname, "tik-porn.scrape.py");
    const rootDir = process.cwd();

    const venvCandidates = [
      path.join(rootDir, "python_runtime", "bin", "python"),
      path.join(rootDir, "python_runtime", "bin", "python3"),
      path.join(rootDir, "python_runtime", "python"),
      path.join(rootDir, "python_runtime", "python.exe"),
      path.join(rootDir, "python_runtime", "Scripts", "python.exe"),
      path.join(rootDir, ".venv", "bin", "python"),
      path.join(rootDir, "venv", "bin", "python")
    ];

    let pythonBin = process.platform === "win32" ? "python" : "python3";
    for (const candidate of venvCandidates) {
      if (fs.existsSync(candidate)) {
        pythonBin = candidate;
        break;
      }
    }

    const jsonConfig = JSON.stringify({ page, limit });
    
    // stdio: ["ignore", "pipe", "ignore"] suppresses Python stderr and stdin
    const pyProcess = spawn(pythonBin, [scriptPath, jsonConfig], {
      cwd: rootDir,
      stdio: ["ignore", "pipe", "ignore"]
    });

    let outputBuffer = "";

    pyProcess.stdout.on("data", (data) => {
      outputBuffer += data.toString();
    });

    pyProcess.on("close", () => {
      try {
        const parsedData = JSON.parse(outputBuffer.trim());
        resolve(parsedData);
      } catch (err) {
        resolve([]);
      }
    });

    pyProcess.on("error", () => {
      resolve([]);
    });
  });
}

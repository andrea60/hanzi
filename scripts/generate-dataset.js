import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import toPinyinTone from "pinyin-tone";
import { exec } from "child_process";

const [, , versionStr, remoteFlag] = process.argv;
if (!versionStr || isNaN(Number(versionStr)))
  throw new Error(
    "Please provide a valid version number as the first argument."
  );

const isRemote = remoteFlag === "--remote" || remoteFlag === "-r";
const version = Number(versionStr);

console.log("Generating dataset version ", version);
if (isRemote)
  console.log("🚨 This will upload the dataset to the production environment!");
else console.log("This will generate the dataset locally without uploading.");

// Get the current file path
const __filename = fileURLToPath(import.meta.url);
// Get the directory name
const __dirname = path.dirname(__filename);

function readAsJson(file) {
  const filePath = path.join(__dirname, `./source/${file}`);
  const content = fs.readFileSync(filePath, "utf8");

  return JSON.parse(content);
}

function readCedict(file) {
  // Regex to parse a line
  const cedictRegex = /^(\S+)\s+(\S+)\s+\[(.+?)\]\s+\/(.+)\/$/;

  const filePath = path.join(__dirname, `./source/${file}`);
  const lines = fs.readFileSync(filePath, "utf8").split("\n");
  console.log("Found CEDICT file with", lines.length, "lines.");
  const entries = [];

  for (const line of lines) {
    if (line.startsWith("#") || line.trim() === "") continue; // skip comments

    const match = line.trim().match(cedictRegex);
    if (match) {
      const [, , simplified, pinyin, definitions] = match;

      entries.push({
        simplified,
        definitions: definitions.split("/").filter((d) => d),
        pinyin: toPinyinTone(pinyin),
      });
    } else console.warn("Could not parse line: '", line, "'");
  }

  return entries;
}

function writeAsJson(file, data) {
  const jsonString = JSON.stringify(data, null);

  console.log("Total JSON size: ", jsonString.length, " characters.");
  // const compressedBuffer = zlib.gzipSync(jsonString);
  fs.writeFileSync(file, jsonString);

  const fileSize = fs.statSync(file).size;
  console.log(
    `Wrote ${file} (${(fileSize / 1024 / 1024).toFixed(2)}MB) to output directory.`
  );
}

// strokes data
const strokesData = readAsJson("strokes.json");

const stats = {
  missingWords: 0,
  mappedWords: 0,
};

const cedictData = readCedict("cedict_ts.u8");

const dictionaryData = {};
const strokeData = {};

for (const entry of cedictData) {
  // for each word in the CEDICT data, we need to find the corresponding stroke
  // there could be multiple, as it could be a composite word such as nihao (你好)
  const chars = entry.simplified.split("");
  let missing = false;
  for (const char of chars) {
    const stroke = strokesData[char];

    if (!stroke) {
      stats.missingWords++;
      missing = true;
      break;
    }
  }
  if (missing) continue;

  const existingEntry = dictionaryData[entry.simplified] || {
    pinyin: [],
    defs: [],
  };

  dictionaryData[entry.simplified] = {
    pinyin: [...existingEntry.pinyin, entry.pinyin],
    defs: [...existingEntry.defs, ...entry.definitions],
  };

  stats.mappedWords++;
}

Object.entries(strokesData).forEach(([character, strokes]) => {
  strokeData[character] = {
    strokes,
  };
});

console.log(
  `Mapped ${stats.mappedWords} characters with pinyin and stroke data, missing strokeData for ${stats.missingWords} characters.`
);

// write the output
const outputDir = path.join(__dirname, "../.tmp");

if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

const targetFileName = `dataset-${version}.json`;
const outputPath = path.join(outputDir, targetFileName);
console.log("Writing to ", outputPath);
writeAsJson(outputPath, {
  strokes: strokeData,
  dictionary: dictionaryData,
});

// Upload to Wrangler

const wranglerCommand = `wrangler r2 object put hanzi/${targetFileName} --file=${outputPath} ${isRemote ? "--remote" : "--local"}`;
exec(wranglerCommand, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error uploading to Wrangler: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`Wrangler stderr: ${stderr}`);
    return;
  }
  console.log(`Wrangler stdout: ${stdout}`);
});

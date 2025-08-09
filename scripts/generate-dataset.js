import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import toPinyinTone from "pinyin-tone";
import { exec } from "child_process";
import { exit } from "process";

const distinct = (input) => Array.from(new Set(input).values());

const isClassifier = (def) => def.startsWith("CL:");

const isChineseChar = (char) => {
  return /[\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF]/.test(char);
};

const isChineseReference = (def) => {
  return def.split("").some(isChineseChar);
};

const removeInnerParenthesis = (str) => {
  // If the whole string is one big (...) block, keep it
  if (/^\([^()]*\)$/.test(str.trim())) {
    return str;
  }
  // Otherwise, remove all (...) blocks
  return str.replace(/\([^()]*\)/g, "");
};

const removeInnerBrackets = (str) => {
  // If the whole string is one big [...] block, keep it
  if (/^\[[^\[\]]*\]$/.test(str.trim())) {
    return str;
  }
  // Otherwise, remove all [...] blocks
  return str.replace(/\[[^\[\]]*\]/g, "");
};

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

      const cleanedDefinitions = definitions
        .split("/")
        .map(removeInnerParenthesis)
        .map(removeInnerBrackets)
        .map((w) => w.trim())
        .filter((d) => d && !isClassifier(d));

      if (cleanedDefinitions.length == 0) {
        console.warn(
          `Word ${simplified} does not have a definition. Original defs: ${definitions}`
        );
        continue;
      }
      entries.push({
        simplified,
        definitions: cleanedDefinitions,
        pinyin: toPinyinTone(pinyin.toLowerCase()),
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
  multiplePinyin: 0,
  unmatchingPinyinWord: 0,
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

  const newEntry = {
    pinyin: distinct([...existingEntry.pinyin, entry.pinyin]),
    defs: distinct([...existingEntry.defs, ...entry.definitions]),
  };

  dictionaryData[entry.simplified] = newEntry;

  if (newEntry.pinyin.length > 1) {
    stats.multiplePinyin++;
  }

  const pinyinCount = newEntry.pinyin[0].split(" ").length;
  if (newEntry.pinyin.some((p) => p.split(" ").length !== pinyinCount)) {
    console.error(
      `Word ${entry.simplified} has multiple pinyins with different lengths. Pinyins: ${newEntry.pinyin.join(", ")}`
    );
    throw new Error("Word has non matching pinyin count");
  }

  const wordCharsCount = entry.simplified.split("").length;
  const pinyinsCount = newEntry.pinyin[0].split(" ").length;
  if (wordCharsCount !== pinyinsCount) {
    console.error(
      `Word ${newEntry.simplified} has unmatching strokes and pinyin counts`,
      newEntry
    );
    stats.unmatchingPinyinWord++;
  }

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
console.log(`Words with multiple pronounciations: ${stats.multiplePinyin}`);
console.error(
  `Words with mismatching pinyin and strokes: ${stats.unmatchingPinyinWord}`
);

// write the output
const outputDir = path.join(__dirname, "../.tmp");

if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

const targetFileName = `dataset-${version}.json`;
const outputPath = path.join(outputDir, targetFileName);
console.log("Writing to ", outputPath);
writeAsJson(outputPath, {
  version,
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

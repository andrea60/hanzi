import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Get the current file path
const __filename = fileURLToPath(import.meta.url);
// Get the directory name
const __dirname = path.dirname(__filename);

function readAsJson(file) {
  const filePath = path.join(__dirname, `./source/${file}`);
  const content = fs.readFileSync(filePath, "utf8");

  return JSON.parse(content);
}

function writeAsJson(file, data) {
  const filePath = path.join(__dirname, `../public/${file}`);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");

  const fileSize = fs.statSync(filePath).size;
  console.log(
    `Wrote ${file} (${(fileSize / 1024 / 1024).toFixed(2)}MB) to output directory.`
  );
}

// strokes data
const strokesData = readAsJson("strokes.json");

// pinyin data
const pinyinData = readAsJson("pinyin.json");

// map each stroke to its pinyin
const characters = {};

const stats = {
  missingPinyin: 0,
  mappedChars: 0,
};

Object.entries(strokesData).forEach(([character, strokeData]) => {
  const pinyin = pinyinData[character];
  if (!pinyin) {
    stats.missingPinyin++;
    return;
  }

  const [mainPinyin, ...alternativePinyin] = pinyin;

  stats.mappedChars++;
  characters[character] = {
    strokeData,
    pinyin: mainPinyin,
    alternativePinyin,
  };
});

console.log(
  `Mapped ${stats.mappedChars} characters with pinyin, missing pinyin for ${stats.missingPinyin} characters.`
);

// write the output
writeAsJson("dataset-v1.0.0.json", characters);

const { execSync } = require("child_process");
const fs = require("fs/promises");
const path = require("path");

const zodiacSigns = [
  "aries",
  "taurus",
  "gemini",
  "cancer",
  "leo",
  "virgo",
  "libra",
  "scorpio",
  "sagittarius",
  "capricorn",
  "aquarius",
  "pisces",
];

(async () => {
  const files = await fs.readdir("outputs");
  const mp4Files = files.filter(
    (file) => path.extname(file).toLowerCase() === ".mp4"
  );

  // create txt file
  let txt = "";
  for (let idx = 0; idx < zodiacSigns.length; idx++) {
    const sign = zodiacSigns[idx];
    const valid = mp4Files.includes(`${sign}.mp4`);
    if (valid) {
      txt += `file '${sign}.mp4'\n`;
    }
  }
  await fs.writeFile("outputs/videos.txt", txt.trim());

  // merge videos
  execSync(
    `ffmpeg -y -f concat -safe 0 -i "outputs/videos.txt" -c copy "outputs/final.mp4"`
  );
})();

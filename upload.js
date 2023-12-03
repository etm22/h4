const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const sharp = require("sharp");
const moment = require("moment");
require("dotenv").config();

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
  // get date
  const date = moment().format("DD MMMM YYYY");

  await generateThumbnail();

  let data = new FormData();
  data.append("video", fs.createReadStream("outputs/final.mp4"));
  data.append("thumbnail", fs.createReadStream("outputs/thumbnail.png"));
  data.append("video_title", `Horoscope ${date} (ALL SIGNS)`);
  data.append(
    "video_description",
    zodiacSigns.map((z) => `${z} horoscope for ${date}`).join("\n")
  );

  // //  upload to yt
  await axios.post(process.env.YT_UPLOADER_API, data);
})();

async function generateThumbnail() {
  /// download background
  const response = await axios.get(
    `https://huggingface.co/upmr/temp/resolve/main/thumbnail_${getRandomInt(
      1,
      8
    )}.png`,
    { responseType: "arraybuffer" }
  );
  fs.writeFileSync("outputs/thumbnail_bg.png", response.data);

  // download speaker
  const response_2 = await axios.get(
    "https://huggingface.co/upmr/temp/resolve/main/speaker_3.png",
    { responseType: "arraybuffer" }
  );
  fs.writeFileSync("outputs/speaker.png", response_2.data);

  const width = 1280;
  const height = 720;
  const date_arr = moment().format("DD MMMM YYYY").split(" ");

  const svgImage = `
  <svg width="${width}" height="${height}" fill="#000">
    <style>
    svg {color: black}
    .title { fill: yellow; font-size: 140px; font-weight: bolder;}
    .sign { fill: black; font-size: 110px; font-weight: bolder;}
    </style>
    <text x="4%" y="20%" class="title">${date_arr[0]}</text>
    <text x="4%" y="42%" class="title">${date_arr[1]}</text>
    <text x="4%" y="64%" class="title">${date_arr[2]}</text>
    <text x="4%" y="89%" class="sign">Horoscope</text>
  </svg>
  `;
  const svgBuffer = Buffer.from(svgImage);

  const base_img = sharp(`outputs/thumbnail_bg.png`);
  const speaker_img = await sharp(`outputs/speaker.png`).toBuffer();

  await base_img
    .composite([
      { input: svgBuffer },
      { input: speaker_img, left: 330, top: 0 },
    ])
    .toFile(`outputs/thumbnail.png`);
}

// Function to generate a random number between min and max (both inclusive)
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

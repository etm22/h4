const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const { scrapeHoroscope } = require("./services/horoscope");
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
  const horoscope = await scrapeHoroscope("aries");

  let data = new FormData();
  data.append("file", fs.createReadStream("outputs/final.mp4"));
  data.append("video_title", `Horoscope ${horoscope.date} (ALL SIGNS)`);
  data.append(
    "video_description",
    zodiacSigns.map((z) => `${z} horoscope for ${horoscope.date}`).join("\n")
  );

  //  upload to yt
  await axios.post(process.env.YT_UPLOADER_API, data);
})();

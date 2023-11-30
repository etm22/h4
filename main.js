const { scrapeHoroscope } = require("./services/horoscope");
const { createTalkingAnimation } = require("./services/ai");
const { execSync } = require("child_process");
const { unlinkSync, writeFileSync } = require("fs");
const axios = require("axios");

(async () => {
  const sign = process.argv[2];
  const horoscope = await scrapeHoroscope(sign);

  await createTalkingAnimation({
    text: horoscope.horoscope,
    speaker: "en_female_jennifer_clone2",
    digital_human_id: "Dom-Standing 6",
    output_dir: "outputs",
    video_name: horoscope.sign,
  });

  //   download bg video
  const res = await axios.get(
    `https://huggingface.co/upmr/temp/resolve/main/vid_2.mp4`,
    { responseType: "arraybuffer" }
  );
  writeFileSync("outputs/bg.mp4", res.data);

  //   create final video
  execSync(
    `ffmpeg -y -i "outputs/bg.mp4" -i "outputs/${
      horoscope.sign
    }.mov" -filter_complex "[1:v]scale=iw/2:ih/2[ovrl]; [0:v][ovrl]overlay=x=(main_w-overlay_w)/2:y=main_h-overlay_h[bg]; [bg]drawtext=text='${capitalizeFirstLetter(
      horoscope.sign
    )}':fontsize=75:fontcolor=white:x=150:y=65, drawtext=text='${
      horoscope.date
    }':fontsize=50:fontcolor=white:x=(w-tw-75):y=75" -shortest -codec:a copy "outputs/${
      horoscope.sign
    }.mp4"`
  );

  unlinkSync(`outputs/${horoscope.sign}.mov`);
  unlinkSync(`outputs/bg.mp4`);
})();

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

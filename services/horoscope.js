const axios = require("axios");
const moment = require("moment");
const { parse } = require("node-html-parser");

async function scrapeHoroscope(sign) {
  const response = await axios.get(
    `https://www.huffpost.com/horoscopes/${sign}`
  );
  const root = parse(response.data);

  const data = JSON.parse(
    JSON.parse(root.querySelector("script#__NEXT_DATA__").textContent).props
      .pageProps.dataStr
  ).horoscopes["tomorrow"].content;

  return {
    date: moment(data.date).format("DD MMMM YYYY"),
    sign: data.sign,
    horoscope: data.content,
  };
}

module.exports = { scrapeHoroscope };

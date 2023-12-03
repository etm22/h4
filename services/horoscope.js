const axios = require("axios");
const moment = require("moment");
const { parse } = require("node-html-parser");

async function scrapeHoroscopeOld(sign) {
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

async function scrapeHoroscope(sign) {
  const date = moment().format("MMMM-D-YYYY").toLocaleLowerCase();

  const response = await axios.get(
    `https://www.vogue.in/horoscope/collection/horoscope-today-${date}/`
  );
  const root = parse(response.data);
  const blocks = root.querySelectorAll(".product-summary");

  const horoscopes = blocks.slice(0, 12).map((b) => {
    return {
      date: moment().format("DD MMMM YYYY"),
      sign: b.parentNode.previousElementSibling.previousElementSibling.textContent
        .split(" ")[0]
        .toLowerCase(),
      horoscope: b.textContent.split("\n")[0],
    };
  });

  return horoscopes.filter((h) => h.sign == sign)[0];
}

module.exports = { scrapeHoroscope };

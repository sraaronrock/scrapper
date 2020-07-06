const puppeteer = require("puppeteer");
const path = require("path");
const { writeFile } = require("fs").promises;
const { createWriteStream } = require("fs");
const { mapSeries } = require("bluebird");
const ora = require(`ora`);
const chalk = require(`chalk`);
const axios = require("axios");
const source = require("./types.json");

async function run() {
  const filtered = source.filter((x) => x.type === "video");
  console.log(filtered.length);
  const videos = await mapSeries(filtered, async ({ url }, indx) => {
    try {
      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      await page.setViewport({ width: 1200, height: 1200 });
      await page.goto(url, {
        waitUntil: `networkidle0`,
      });
      await page.waitFor(5000);

      const videoSrc = await page.evaluate(() => {
        const imgArr = document.querySelectorAll(`video.tWeCl`);
        return [].map.call(imgArr, (img) => img.src);
      });

      await browser.close();

      if (videoSrc.length === 0) return;
      const cleanURL = videoSrc[0];

      const response = await axios({
        url: cleanURL,
        method: "GET",
        responseType: "stream",
      });
      await response.data.pipe(
        createWriteStream(`./videos/${indx}.mp4`)
      );
      return { url };
    } catch (err) {
      console.log("ERROR", { indx, url });
      return 0;
    }
  });

  console.log("Saved ");
}

run();

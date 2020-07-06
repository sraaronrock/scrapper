const puppeteer = require("puppeteer");
const path = require("path");
const { writeFile } = require("fs").promises;
const { createWriteStream } = require("fs");
const { mapSeries } = require("bluebird");
const ora = require(`ora`);
const chalk = require(`chalk`);
const axios = require("axios");
const source = require("./source.json");

async function run() {
  const images = await mapSeries(source, async ({ url }, indx) => {
    try {
      console.log(indx);
      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      await page.setViewport({ width: 1200, height: 1200 });
      await page.goto(url, {
        waitUntil: `networkidle0`,
      });

      const imgSrc = await page.evaluate(() => {
        const imgArr = document.querySelectorAll(`img.FFVAD`);
        return [].map.call(imgArr, (img) => img.srcset);
      });

      const videoSrc = await page.evaluate(() => {
        const imgArr = document.querySelectorAll(`video.tWeCl`);
        return [].map.call(imgArr, (img) => img.src);
      });

      await browser.close();
      let type;
      let cleanURL;
      if (videoSrc.length === 0 && imgSrc.length === 0) return 0;

      if (imgSrc.length) type = "imagen";
      if (videoSrc.length) type = "video";
     
      return { url, type };
    } catch (err) {
      console.log('ERROR', { indx, url });
      return 0;
    }
  });

  await writeFile(`types.json`, JSON.stringify(images));
  console.log("Saved ");
}

run();

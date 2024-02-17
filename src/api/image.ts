import express from 'express';
import satori from 'satori';
import { Resvg } from "@resvg/resvg-js";
import fs from 'fs';

const html = async (...args: string[]) => {
  const { html } = await import('satori-html');
  // @ts-ignore
  return html(...args);
}

const router = express.Router();

const fontArrayBuffer = fs.readFileSync("src/fonts/Roboto-Regular.ttf");

router.get<{}, Buffer>('/', async (req, res) => {
    const markup = await html(`<div style="color: red;">hello, world</div>`);

  const svg = await satori(markup, {
    width: 600,
    height: 400,
    fonts: [
      {
        name: 'Roboto Regular',
        data: fontArrayBuffer,
        weight: 400,
        style: 'normal',
      },
    ],
  });

  // render png
  const resvg = new Resvg(svg, {
    background: "rgba(238, 235, 230, .9)",
  });
  const pngData = resvg.render();
  const pngBuffer = pngData.asPng();

  res.writeHead(201, {
      'Content-Type': 'image/png' // drop Content-Length as it should be automatically added by express
  });

  res.end(pngBuffer);
});

export default router;
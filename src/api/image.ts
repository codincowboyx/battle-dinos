import express from 'express';
import satori from 'satori';
import { Resvg } from "@resvg/resvg-js";
import fs from 'fs';
import { gameState, IGameState, Turn } from '../state/gameState';

const html = async (...args: string[]) => {
  const { html } = await import('satori-html');
  // @ts-ignore
  return html(...args);
}

const getTextMarkup = async (str: string) => {
  return await html(`<div style="
    align-items: center;
    display: flex;
    width: 100%;
    height: 100%;
    background-color: #f4f4f4;
    padding: 20;
    line-height: 1.2;
    font-size: 24;
  ">
    ${str}
  </div>`);
}

const router = express.Router();

const fontArrayBuffer = fs.readFileSync("src/fonts/Roboto-Regular.ttf");

router.get<{}, Buffer | string>('/', async (req, res) => {
  try {
      const gameId = req.query['id'] as string;
        const errorStr = req.query['error'] as string;
        // const fid = parseInt(req.query['fid']?.toString() || '')
        if (!gameId || Array.isArray(gameId)) {
            return res.status(400).send('Missing game ID');
        }

        let game: IGameState | null = await gameState.getState(gameId);
        console.log(game);

        if (!game) {
            return res.status(400).send('Missing game ID');
        }

        let markup = await getTextMarkup(errorStr ? errorStr : `Error Occured :/`)

        let svg = await satori(
            markup,
            {
                width: 600, height: 400, fonts: [{
                    data: fontArrayBuffer,
                    name: 'Roboto',
                    style: 'normal',
                    weight: 400
                }]
            });

        try {
            if (errorStr) {
                // do nothing for now
            } else if (game.turn === Turn.SEEKING_OPPONENT || game.turn === Turn.SEEKING_PLAYER) {
                const text = game.turn === Turn.SEEKING_OPPONENT ? "Looking for challenger. Join Now!" : "Ready Player One? Join Now!";
                svg = await satori(await getTextMarkup(text),
                    {
                        width: 600, height: 400, fonts: [{
                            data: fontArrayBuffer,
                            name: 'Roboto',
                            style: 'normal',
                            weight: 400
                        }]
                    })
            } else if (game) {
                const player1Health = `${game.player1Dino?.health}%`;
                const player2Health = `${game.player2Dino?.health}%`;

                const baseHealthStyle = {
                    borderBottomLeftRadius: "50px", borderTopLeftRadius: "50px"
                }

                const player1HealthBarStyle = {
                    ...baseHealthStyle,
                    borderBottomRightRadius: game.player1Dino?.health === 100 ? "50px" : "0px", 
                    borderTopRightRadius: game.player1Dino?.health === 100 ? "50px" : "0px"
                }

                const player2HealthBarStyle = {
                    ...baseHealthStyle,
                    borderBottomRightRadius: game.player2Dino?.health === 100 ? "50px" : "0px", 
                    borderTopRightRadius: game.player2Dino?.health === 100 ? "50px" : "0px"
                }
                let winnerText = "";

                if (game.turn === Turn.PLAYER1_WON) {
                    winnerText = `Player 1 Won (${game.player1Fid})!`
                } else if (game.turn === Turn.PLAYER2_WON) {
                    winnerText = `Player 2 Won (${game.player2Fid})!`
                }

                let markup = await html(`
                  <div style="
                    justify-content: flex-start;
                    align-items: center;
                    display: flex;
                    flex-wrap: wrap;
                    width: 100%;
                    height: 100%;
                    background-color: #f4f4f4;
                    padding: 40;
                    line-height: 1.2;
                    font-size: 24;
                    position: relative;
                ">
                    <div style="
                        display: flex;
                        flex-direction: row;
                        width: 100%;
                        justify-content: space-between;
                        box-sizing: border-box;
                    ">
                        <div style="
                          border-left: 2px solid black;
                          border-bottom: 2px solid black;
                          display: flex;
                          flex-direction: row;
                          height: 62px;
                          padding: 20px;
                          box-sizing: border-box;
                        ">
    
                          <div style="display: flex; height: 20px; line-height: 20px; margin-right: 16px">${game.turn === Turn.PLAYER1 ? "*" : ""}HP: </div>
                          <div style="
                            display: flex;
                              height: 20px;
                              width: 180px;
                              background: rgba(8,102,220,.2);
                              box-shadow: 2px 14px 15px -7px rgba(30, 166, 250, 0.36);
                              border-radius: 50px"
                              >
                            <div style="
                              display: flex; 
                              width: ${player1Health}; 
                              height: 20px; 
                              background: #0866dc; 
                              border-bottom-left-radius: ${player1HealthBarStyle.borderBottomLeftRadius};
                              border-bottom-right-radius: ${player1HealthBarStyle.borderBottomRightRadius};
                              border-top-left-radius: ${player1HealthBarStyle.borderTopLeftRadius};
                              border-top-right-radius: ${player1HealthBarStyle.borderTopRightRadius};
                            "></div>
                          </div>
                        </div>
                        <img src="https://tinydinos.org/transparent/${game.player1Dino?.id ?? "6600"}.png" width="160" height="160" style="transform: scaleX(-1);"/>
                    </div>
                    <div style="position: absolute; display: flex; justify-content: center; width: 100%">${winnerText}</div>
                    <div style="
                        display: flex;
                        flex-direction: row;
                        width: 100%;
                        justify-content: space-between;
                        box-sizing: border-box;
                    ">
                        <img src="https://tinydinos.org/transparent/${game.player2Dino?.id ?? "763"}.png" width="160" height="160"/>
                        <div style="
                          border-right: 2px solid black;
                          border-top: 2px solid black;
                          display: flex;
                          flex-direction: row;
                          height: 62px;
                          padding: 20px;
                          margin-top: 120px;
                        ">
    
                          <div style="display: flex; height: 20px; line-height: 20px; margin-right: 16px">${game.turn === Turn.PLAYER2 ? "*" : ""}HP: </div>
                          <div style="
                            display: flex;
                              height: 20px;
                              width: 180px;
                              background: rgba(8,102,220,.2);
                              box-shadow: 2px 14px 15px -7px rgba(30, 166, 250, 0.36);
                              border-radius: 50px;"
                              >
                            <div style="
                              width: ${player2Health}; 
                              height: 20px; 
                              background: #0866dc;
                              display: flex;
                              border-bottom-left-radius: ${player2HealthBarStyle.borderBottomLeftRadius};
                              border-bottom-right-radius: ${player2HealthBarStyle.borderBottomRightRadius};
                              border-top-left-radius: ${player2HealthBarStyle.borderTopLeftRadius};
                              border-top-right-radius: ${player2HealthBarStyle.borderTopRightRadius};
                            "></div>
                          </div>
                        </div>
                    </div>
                </div>
                `)

                svg = await satori(
                  markup,
                    {
                        width: 764, height: 400, fonts: [{
                            data: fontArrayBuffer,
                            name: 'Roboto',
                            style: 'normal',
                            weight: 400
                        }]
                    })
            }
        } catch (err) {
            console.error(err);
        }

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
  } catch(error) {
    console.error(error);
        res.status(500).send('Error generating image');
  }
});

export default router;
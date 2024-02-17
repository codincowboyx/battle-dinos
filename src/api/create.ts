import express from 'express';
import {gameState} from '../state/gameState';
import { z } from "zod";

const router = express.Router();

router.post<{}, string>('/', async (req, res) => {
    const dinoId1 = req.query['dinoId1'] as string;
    const dinoId2 = req.query['dinoId2'] as string;
    const schema = z.object({
      dinoId1: z.string().min(1).max(10000).nullable().default("6600"),
      dinoId2: z.string().min(1).max(10000).nullable().default("763"),
    });
    const parse = schema.safeParse({
      dinoId1,
      dinoId2
    });
  
    if (!parse.success) {
      console.log(parse.error)
      return { message: "unable to make game"}
    }
  
    const data = parse.data;
  
    const time = new Date().getTime();
  
    const id = await gameState.startGame(time, data.dinoId1 ?? undefined, data.dinoId2 ?? undefined);

    res.json(`game made successfully: ${id}`);
});

export default router;
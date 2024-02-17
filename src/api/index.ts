import express from 'express';

import MessageResponse from '../interfaces/MessageResponse';
import vote from './vote';
import image from './image';
import create from './create';

const router = express.Router();

router.get<{}, MessageResponse>('/', (req, res) => {
  res.json({
    message: 'API - 👋🌎🌍🌏',
  });
});

router.use('/vote', vote);
router.use('/image', image);
router.use('/create', create);

export default router;

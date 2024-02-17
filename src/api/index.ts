import express from 'express';

import MessageResponse from '../interfaces/MessageResponse';
import vote from './vote';
import image from './image';

const router = express.Router();

router.get<{}, MessageResponse>('/', (req, res) => {
  res.json({
    message: 'API - 👋🌎🌍🌏',
  });
});

router.use('/vote', vote);
router.use('/image', image)

export default router;

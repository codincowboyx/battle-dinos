import express from 'express';

const router = express.Router();

router.get<{}, string>('/', (req, res) => {
  res.json("hi");
});

export default router;

import express from 'express';
import { getWordMeaning } from '../controllers/ai/wordMeaningController.js';

const router = express.Router();

router.post('/word-meaning', getWordMeaning);

export default router;
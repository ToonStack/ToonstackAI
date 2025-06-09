import express from "express";
import { chat } from "../controllers/ai/chatController.js";
import { getWordMeaning } from "../controllers/ai/wordMeaningController.js";
import { textToSpeech } from "../controllers/ai/ttsController.js";

const router = express.Router();

// Word Meaning Route
router.post("/word-meaning", getWordMeaning);

// Chat Route
router.post("/chat", chat);

// Text-to-Speech Route
router.post("/audio", textToSpeech);

export default router;
// controllers/ai/ttsController.js

import { convertTextToSpeech } from "../../config/elevenLabs.js";

export const textToSpeech = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Text is required for audio conversion" });
    }

    const audioStream = await convertTextToSpeech(text);

    res.set({
      "Content-Type": "audio/mpeg",
      "Content-Disposition": "inline; filename=tts.mp3",
    });

    audioStream.pipe(res);
  } catch (error) {
    console.error("Error in /api/audio:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

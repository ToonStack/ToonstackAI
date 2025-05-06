import express from "express";
import dotenv from 'dotenv'
import { connectDB } from "./config/db.js"
import { queryAzureOpenAI } from './azureOpenAI.js';
import { convertTextToSpeech } from './elevenLabs.js';
import contentRoutes from './routes/contentRoutes.js';
import Content from "./models/Content.js";
import cors from "cors"
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express()


dotenv.config()
const PORT = process.env.PORT || 3000

connectDB()

app.use(express.urlencoded({ extended: true }));
app.use(express.static("audio"));
app.use(express.static("public"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json())
app.use(cors());

app.get("/word-meaning", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "word-meaning.html"));
});

app.get("/list-stories", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "list-stories.html"));
});

// Content Routes
app.use('/api/content', contentRoutes);

// Chatbot Query Endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    //  Search MongoDB for relevant content
    const searchResults = await Content.find({
      $or: [
        { title: new RegExp(query, 'i') },  // Matches title
        { body: new RegExp(query, 'i') },   // Matches body
        { tags: query.toLowerCase() }       // Matches tags exactly
      ]
    }).limit(5);

    let context = 'No relevant database content found.';
    if (searchResults.length > 0) {
      context = searchResults.map((doc) => `Title: ${doc.title}\nContent: ${doc.body}`).join('\n\n');
    }

    //  Call Azure OpenAI
    const aiResponse = await queryAzureOpenAI(query, context);

    res.json({ response: aiResponse });
  } catch (error) {
    console.error('Error in /api/chat:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/audio', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required for audio conversion' });
    }

    const audioStream = await convertTextToSpeech(text);

    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Disposition': 'inline; filename=tts.mp3',
    });

    audioStream.pipe(res);
  } catch (error) {
    console.error('Error in /api/audio:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(PORT, () => {
  console.log(`Toonstack AI Services Server Running on PORT ${PORT}`)
})
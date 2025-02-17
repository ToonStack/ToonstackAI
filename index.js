import express from "express";
import dotenv from 'dotenv'
import mongoose from "mongoose";
import colors from "colors";
import { queryAzureOpenAI } from './azureOpenAI.js';
import contentRoutes from './routes/contentRoutes.js';
import Content from "./models/Content.js";
const app = express()


dotenv.config()
const PORT = process.env.PORT || 3000

const connectDB = async () => {
  try {
      const conn = await mongoose.connect(process.env.MONGO_URI, {
          dbName: 'ToonstackAI'
      });
      console.log(`MongoDB connected: ${conn.connection.host}`.green.underline);
  } catch (error) {
      console.error('MongoDB connection error!', error);
      process.exit(1);
  }
}
connectDB()

app.use(express.static("public"));
app.use(express.json())

app.get('/', (req, res) => {
  res.send('Hello World!')
})

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

app.listen(PORT, () => {
  console.log(`Toonstack AI Services Server Running on PORT ${PORT}`)
})
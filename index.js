import express from "express";
import dotenv from 'dotenv'
import { connectLyricsDB } from "./config/lyricsDB.js"
import cors from "cors"
import path from "path";
import { fileURLToPath } from "url";
import routes from './routes/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express()


dotenv.config()
const PORT = process.env.PORT || 3000

connectLyricsDB()

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

import debugUploadRoute from './routes/debugUploadRoute.js';
app.use('/debug', debugUploadRoute);



// Use all routes via central index
app.use('/api', routes);

app.listen(PORT, () => {
  console.log(`Toonstack AI Services Server Running on PORT ${PORT}`)
})
# 🎨 ToonstackAI

**ToonstackAI** is a conversational API that fuses advanced AI with creative storytelling. It processes user queries, enriches them using relevant content from a curated MongoDB database, generates smart and context-aware responses via **Azure OpenAI**, and brings these responses to life through **ElevenLabs' lifelike Text-to-Speech (TTS)** synthesis.

> 🎯 Designed for educational, entertainment, and interactive voice-based platforms.

---

## 🚀 Features

- ✨ **Conversational AI** – Generate intelligent, natural-sounding responses powered by Azure OpenAI  
- 🧠 **Contextual Understanding** – Enrich user input by embedding relevant MongoDB content  
- 🎧 **Realistic Speech Output** – Convert AI text into humanlike voice using ElevenLabs TTS  
- 🎞️ **Playlist + Video Intelligence** – Get lyrics, meanings, and story context from rich media  
- 🔍 **Word Meaning Extraction** – Look up words within video subtitles and learn them in context  
- ⚡ **Caching with Redis** – Ultra-fast response times using smart caching  
- 📜 **Secure & Scalable** – Environment-based configs, modular structure, and scalable endpoints  

---

## 💡 Example Use Case

Imagine a child watches an animated story, hears a word they don’t understand ("barren"). With ToonstackAI:

1. The word is matched in the subtitle (.srt) fetched from Azure Blob
2. A snippet of lyrics provides context
3. Azure OpenAI explains it in a child-friendly tone
4. ElevenLabs reads it aloud in a friendly voice

**All in real-time ⚡**

---

## 🧰 Tech Stack

| Layer           | Technology                            |
|------------------|----------------------------------------|
| **Backend**      | Node.js, Express                      |
| **Database**     | MongoDB + Mongoose ORM                |
| **AI Engine**    | Azure OpenAI (Chat Completions API)   |
| **TTS Engine**   | ElevenLabs (Text-to-Speech API)       |
| **File Storage** | Azure Blob (video & subtitle storage) |
| **Cache**        | Redis (fast word meaning caching)     |

import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import routes from './routes/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Load environment
const env = process.env.NODE_ENV;

if (!env) {
  console.warn("⚠️  NODE_ENV not set. Falling back to development environment.");
}

dotenv.config({ path: `.env.${env || 'development'}` });

// Log current environment (not in production)
if (env !== 'production') {
  console.log(`🛠️  Environment: ${env || 'development'}`);
}

const PORT = process.env.PORT || 3000;

// Connect to DB
connectDB();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static("audio"));
app.use(express.static("public"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(cors());

// Static pages
app.get("/word-meaning", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "word-meaning.html"));
});

app.get("/list-stories", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "list-stories.html"));
});

// Conditionally register debug route
if (env !== 'production') {
  import('./routes/debugUploadRoute.js').then((debugUploadRouteModule) => {
    app.use('/debug', debugUploadRouteModule.default);
    console.log("🧪 Debug route enabled");
  }).catch((err) => {
    console.error("❌ Failed to load debug route:", err);
  });
}

// Main API routes
app.use('/api', routes);

// Start server
app.listen(PORT, () => {
  if (env !== 'production') {
    console.log(`🚀 Toonstack AI Services Server running on PORT ${PORT}`);
  }
});
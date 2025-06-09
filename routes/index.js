// routes/index.js

import express from "express";
import aiRoutes from "./aiRoutes.js";
import contentRoutes from "./contentRoutes.js"; 

const router = express.Router();

// Use the AI routes
router.use("/ai", aiRoutes);

// Use the content routes
router.use("/content", contentRoutes);

export default router;

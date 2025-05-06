import express from 'express';
import contentRoutes from './contentRoutes.js';
import wordMeaningRoutes from './aiRoutes.js'


const router = express.Router();

router.use('/content', contentRoutes);
router.use('/ai', wordMeaningRoutes);


export default router;

import express from 'express';
import contentRoutes from './contentRoutes.js';


const router = express.Router();

router.use('/content', contentRoutes);


export default router;

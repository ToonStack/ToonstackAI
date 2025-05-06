import express from 'express';
import dotenv from 'dotenv';
dotenv.config();

import {
  addContent,
  getAllContent,
  searchContent,
  getContentById
} from '../controllers/contentController.js';

const router = express.Router();

router.post('/add', addContent);
router.get('/', getAllContent);
router.get('/search', searchContent);
router.get('/:id', getContentById);

export default router;

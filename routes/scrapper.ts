import express from 'express';
import Scrapper from '../controllers/scrapper';

const router = express.Router()

router.post('/', Scrapper.scrap)

export default router;
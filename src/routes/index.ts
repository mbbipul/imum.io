import express from 'express';
import { otomotoRouter } from './scraping/otomoto';

const router = express.Router();

router.use('/scrapping',otomotoRouter)

export { router as scrappingRouter };

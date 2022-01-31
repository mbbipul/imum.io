import express from 'express';
import { scrapData } from '../../controllers/scrapping/otomoto';

const router = express.Router();

router.get('/otomoto', scrapData);

export { router as otomotoRouter };

import express from 'express';
import { homeController } from '../controllers/homeController';

const router = express.Router();

router.get('/', homeController.index);
router.get('/tim-kiem', homeController.search);
router.get('/tim-kiem/preview', homeController.search);

export default router;

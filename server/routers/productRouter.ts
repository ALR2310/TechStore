import express from 'express';
import { productController } from '../controllers/productController';

const router = express.Router();

router.get('/:slugs', productController.index);
router.post('/danh-gia', productController.review);

export default router;

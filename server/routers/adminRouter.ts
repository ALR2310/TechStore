import express from 'express';
import { adminController } from '../controllers/adminController';
import upload from '../middleware/upload';

const router = express.Router();

router.get('/', adminController.indexPage);
router.get('/product', adminController.productPage);
router.delete('/product/delete', adminController.productDelete);
router.get('/product/create', adminController.productCreatePage);
router.post('/product/create', upload.single('Image'), adminController.productCreate);
router.get('/product/update/:id', adminController.productUpdatePage);
router.post('/product/import-from-url', adminController.productImportFromURL);
router.post('/product/check-product-name', adminController.productCheckName);
router.post('/categories/create', adminController.categoryCreate);
router.post('/brands/create', adminController.brandCreate);
router.post('/brand-series/create', adminController.brandSeriesCreate);
router.get('/user', adminController.userPage);
router.patch('/user', adminController.userUpdate);
router.delete('/user', adminController.userDelete);
router.get('/order', adminController.orderPage);
router.post('/order/status', adminController.orderStatusUpdate);

export default router;

import express from 'express';
import { apiController } from '~/controllers/apiController';
import upload from '~/middleware/upload';

const router = express.Router();

router.get('/auth/check', apiController.checkLogin);

router.get('/user', apiController.getListUser);
router.get('/user/:id', apiController.getUser);
router.put('/user/:id', apiController.updateUser);
router.delete('/user/:id', apiController.deleteUser);

router.get('/product', apiController.getListProduct);
router.get('/product/:id', apiController.getProduct);
router.post('/product', upload.single('image'), apiController.createProduct);
router.put('/product/:id', upload.single('image'), apiController.updateProduct);
router.delete('/product/:id', apiController.deleteProduct);

router.get('/category', apiController.getListCategory);
router.get('/category/:id', apiController.getCategory);
router.post('/category', apiController.createCategory);
router.put('/category/:id', apiController.updateCategory);
router.delete('/category/:id', apiController.deleteCategory);

router.get('/brand', apiController.getListBrand);

router.get('/order', apiController.getListOrder);
router.put('/order/:id', apiController.approveOrder);

router.get('/review', apiController.getListReview);
router.post('/review/status', apiController.updateStatusReview);
router.delete('/review/:id', apiController.deleteReview);

export default router;

import express from 'express';
import { apiController } from '~/controllers/apiController';

const router = express.Router();

router.get('/user', apiController.getListUser);
router.get('/user/:id', apiController.getUser);
router.put('/user/:id', apiController.updateUser);
router.delete('/user/:id', apiController.deleteUser);

router.get('/product', apiController.getListProduct);

export default router;

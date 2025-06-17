import express from 'express';
import { checkUser } from '../middleware/authenticate';
import { userController } from '../controllers/userController';

const router = express.Router();

router.get('/', checkUser, userController.index);
router.post('/profile-update', checkUser, userController.profileUpdate);
router.post('/address-create', checkUser, userController.addressCreate);
router.post('/address-default', checkUser, userController.addressUpdateDefault);
router.post('/address-delete', checkUser, userController.addressDelete);
router.post('/order-create', checkUser, userController.orderCreate);

export default router;

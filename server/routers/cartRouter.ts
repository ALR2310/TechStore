import express from 'express';
import { checkUser } from '../middleware/authenticate';
import { cartController } from '../controllers/cartController';

const router = express.Router();

router.get('/', checkUser, cartController.index);
router.post('/create', checkUser, cartController.create);
router.post('/update', checkUser, cartController.update);
router.post('/delete', checkUser, cartController.delete);

export default router;

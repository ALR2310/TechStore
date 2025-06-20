import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { checkToken } from '~/middleware/authenticate';

const router = express.Router();

router.use(checkToken);
router.use('/api', require('./apiRouter').default);
router.use('/', require('./homeRouter').default);
router.use('/auth', require('./authRouter').default);
router.use('/admin', require('./adminRouter').default);
router.use('/gio-hang', require('./cartRouter').default);
router.use('/tai-khoan', require('./userRouter').default);
router.use('/san-pham', require('./productRouter').default);
router.use((_req: Request, res: Response, _next: NextFunction) => {
  res.status(404).sendFile(path.join(__dirname, '..', 'views', 'layouts', 'error.html'));
});

export default router;

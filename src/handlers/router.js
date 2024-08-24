const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const path = require('path');

router.use(authenticate.checkToken);
router.use('/', require('./homeHandler'));
router.use('/auth', require('./authHandler'));
router.use('/admin', require('./adminHandler'));
router.use('/tai-khoan', require('./userHandler'));
router.use('/san-pham', require('./productHandler'));
router.use((req, res, next) => {
    res.status(404).sendFile(path.join(__dirname, '..', 'views', 'layouts', 'error.html'));
});

module.exports = router;
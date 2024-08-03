const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authenticateToken');

router.use(authenticateToken);
router.use('/', require('./homeHandler'));
router.use('/auth', require('./authHandler'));

module.exports = router;
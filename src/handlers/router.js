const express = require('express');
const router = express.Router();

router.use('/', require('./homeHandler'));
router.use('/auth', require('./authHandler'));

module.exports = router;
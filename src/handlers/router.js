const express = require('express');
const router = express.Router();

router.use('/', require('./homeHandler'));

module.exports = router;
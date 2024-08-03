const express = require('express');
const router = express.Router();
const db = require('../configs/dbConnect.js');

router.get('/', async (req, res) => {
    res.render('home/index');
});

module.exports = router;

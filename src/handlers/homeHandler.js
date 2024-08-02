const express = require('express');
const router = express.Router();
const dbConnect = require('../configs/dbConnect.js');

router.get('/', async (req, res) => {
    const db = await dbConnect;
    const [results] = await db.query('select * from user');

    console.log(results);

    res.render('home/index');
});

router.get('/about', (req, res) => {
    res.render('home/about');
});

module.exports = router;

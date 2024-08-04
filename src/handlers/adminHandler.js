const express = require("express");
const router = express.Router();

router.get('/', (req, res) => {
    res.render('admin/index', { layout: 'admin' });
});

router.get('/product', (req, res) => {
    res.render('admin/product', { layout: 'admin' });
});

module.exports = router;

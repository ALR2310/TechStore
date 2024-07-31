const express = require("express");
const router = express.Router();
const homeCtrl = require("../controllers/homeController");

router.get("/", homeCtrl.index);
router.get("/edit", homeCtrl.index);

module.exports = router;
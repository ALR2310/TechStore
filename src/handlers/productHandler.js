const express = require("express");
const router = express.Router();
const db = require("../configs/dbConnect");

router.get("/", (req, res) => {
    res.render("product/index");
});

router.get("/:categoryName", async (req, res) => {
    const categoryName = req.params.categoryName;

    res.send("Lấy ra các sản phẩm thuộc " + categoryName);
});

module.exports = router;
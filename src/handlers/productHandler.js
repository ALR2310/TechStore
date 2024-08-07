const express = require("express");
const router = express.Router();
const db = require("../configs/dbConnect");
const path = require('path');

router.get("/", (req, res) => {
    res.render("product/index");
});

router.get("/:categoryName", async (req, res) => {
    const categoryName = req.params.categoryName;
    try {
        const getCategory = await db.query('SELECT Id FROM Categories WHERE Slugs = ?', [categoryName]);

        if (getCategory?.length == 0)
            return res.status(404).sendFile(path.join(__dirname, '..', 'views', 'layouts', 'error.html'));

        const sql = `SELECT p.*, pd.DeviceCfg, (p.Price - (p.Price * (p.Discount / 100))) AS FinalPrice 
            FROM Product p JOIN ProductDetails pd ON p.Id = pd.ProdId WHERE p.CateId = ?`;
        const product = await db.query(sql, [getCategory[0].Id]);

        product.forEach(product => {
            const simpleDeviceCfg = extractSimpleDeviceCfg(product.DeviceCfg);
            product.DeviceCfg = simpleDeviceCfg;
            product.FinalPrice = parseFloat(product.FinalPrice).toFixed(0);
        });

        console.log(product);

        return res.render("product/index", { product });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ success: false, message: 'Lỗi máy chủ', data: e });
    }
});



function extractSimpleDeviceCfg(deviceCfg) {
    const cfgLines = deviceCfg.split('\n').map(line => line.trim());
    const simpleDeviceCfg = {};

    cfgLines.forEach(line => {
        if (line.startsWith('CPU') || line.startsWith('CPU;')) {
            const match = line.match(/Ultra\s+\d+/) || line.match(/i[0-9]-\d+[A-Za-z]/) || line.match(/Ryzen(?:™)?\s[0-9]+/);
            simpleDeviceCfg.CPU = match ? match[0] : 'none';
        } else if (line.startsWith('VGA') || line.startsWith('Card đồ họa')) {
            const match = line.match(/RTX(?:™)? (\d+)/i) || line.match(/AMD Radeon/i) || line.match(/Intel® Arc/i);
            simpleDeviceCfg.VGA = match ? match[0] : 'none';
        } else if (line.startsWith('RAM')) {
            const match = line.match(/[0-9]+GB/);
            simpleDeviceCfg.RAM = match ? match[0] : 'none';
        } else if (line.startsWith('Ổ') || line.startsWith('Ổ cứng')) {
            const match = line.match(/[0-9]+TB/) || line.match(/[0-9]+GB/);
            simpleDeviceCfg.Disk = match ? match[0] : 'none';
        } else if (line.startsWith('Màn hình')) {
            const match = line.match(/(\d+(\.\d+)?[-\s]inch)/i) || line.match(/(\d+(\.\d+)?)"/i);
            simpleDeviceCfg.Display = match ? match[0] : 'none';
            const match1 = line.match(/(\d+Hz)/i);
            simpleDeviceCfg.Refresh = match1 ? match1[0] : 'none';
        }
    });

    return simpleDeviceCfg;
}



module.exports = router;
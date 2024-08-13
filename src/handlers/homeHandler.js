const express = require('express');
const router = express.Router();
const db = require('../configs/dbConnect.js');

router.get('/', async (req, res) => {
    try {
        const sqlProduct = `
            SELECT 
                p.*, 
                pd.DeviceCfg,
                TRUNCATE(p.Price - (p.Price * (p.Discount / 100)), 0) AS FinalPrice,
                c.CateName, 
                FLOOR((ROW_NUMBER() OVER (ORDER BY p.id) - 1) / 5) + 1 AS GroupNumber 
            FROM 
                Product p JOIN categories c ON p.CateId = c.Id 
                JOIN ProductDetails pd ON p.Id = pd.ProdId
            WHERE 
                c.CateName = ? AND 
                p.Status = "Active" 
            LIMIT 12`;

        const [prdLaptop, prdLaptopGaming] = await db.queryAll([
            { sql: sqlProduct, params: ["Laptop"] },
            { sql: sqlProduct, params: ["Laptop Gaming"] }
        ]);

        const groupBy = (products) =>
            Object.values(products.reduce((acc, prd) => {
                prd.DeviceCfg = extractSimpleDeviceCfg(prd.DeviceCfg);
                acc[prd.GroupNumber] = acc[prd.GroupNumber] || [];
                acc[prd.GroupNumber].push(prd);
                return acc;
            }, {}));

        const prdLaptopGroups = groupBy(prdLaptop);
        const prdLaptopGamingGroups = groupBy(prdLaptopGaming);

        return res.render('home/index', { prdLaptop: prdLaptopGroups, prdLaptopGaming: prdLaptopGamingGroups });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ success: false, message: 'Lỗi máy chủ', data: e });
    }
});

// Hàm trích xuất thông tin cấu hình cơ bản từ trường cấu hình trong sản phẩm
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

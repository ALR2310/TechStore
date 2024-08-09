const express = require("express");
const router = express.Router();
const db = require("../configs/dbConnect");
const path = require('path');


router.get("/:slugs", async (req, res) => {
    const slugs = req.params.slugs;
    const { sort, price, cpu, ram, vga, demand, brand, count } = req.query;

    let sortParams, priceParams, cpuParams, ramParams, vgaParams, demandParams, brandParams, countParams;

    switch (sort) {
        case 'newest': sortParams = "p.AtUpdate DESC"; break;
        case 'oldest': sortParams = "p.AtUpdate ASC"; break;
        case 'asc': sortParams = "p.Price ASC"; break;
        case 'desc': sortParams = "p.Price DESC"; break;
        default: sortParams = "p.AtUpdate DESC"; break;
    }
    switch (price) {
        case "10": priceParams = "p.Price <= 10000000"; break;
        case '10-15': priceParams = "p.Price BETWEEN 10000000 AND 15000000"; break;
        case '15-20': priceParams = "p.Price BETWEEN 15000000 AND 20000000"; break;
        case '20-25': priceParams = "p.Price BETWEEN 20000000 AND 25000000"; break;
        case '25-30': priceParams = "p.Price BETWEEN 25000000 AND 30000000"; break;
        case '30': priceParams = "p.Price >= 30000000"; break;
        default: priceParams = ''; break;
    }
    switch (cpu) {
        case "intel-i9": cpuParams = "pd.DeviceCfg LIKE '%i9%' AND pd.DeviceCfg LIKE '%Intel%Core%'"; break;
        case "intel-i7": cpuParams = "pd.DeviceCfg LIKE '%i7%' AND pd.DeviceCfg LIKE '%Intel%Core%'"; break;
        case "intel-i5": cpuParams = "pd.DeviceCfg LIKE '%i5%' AND pd.DeviceCfg LIKE '%Intel%Core%'"; break;
        case "intel-i3": cpuParams = "pd.DeviceCfg LIKE '%i3%' AND pd.DeviceCfg LIKE '%Intel%Core%'"; break;
        case "amd-9": cpuParams = "pd.DeviceCfg LIKE '%Ryzen%' AND pd.DeviceCfg LIKE '%7%'"; break;
        case "amd-7": cpuParams = "pd.DeviceCfg LIKE '%Ryzen%' AND pd.DeviceCfg LIKE '%7%'"; break;
        case "amd-5": cpuParams = "pd.DeviceCfg LIKE '%Ryzen%' AND pd.DeviceCfg LIKE '%5%'"; break;
    }
    switch (ram) {
        case '64': ramParams = "pd.DeviceCfg LIKE '%RAM; 64GB%'"; break;
        case '32': ramParams = "pd.DeviceCfg LIKE '%RAM; 32GB%'"; break;
        case '16': ramParams = "pd.DeviceCfg LIKE '%RAM; 16GB%'"; break;
        case '8': ramParams = "pd.DeviceCfg LIKE '%RAM; 8GB%'"; break;
        case '4': ramParams = "pd.DeviceCfg LIKE '%RAM; 4GB%'"; break;
    }
    switch (vga) {
        case "nvidia": vgaParams = "pd.DeviceCfg LIKE '%GeForce%' AND pd.DeviceCfg LIKE '%NVIDIA%'"; break;
        case "amd": vgaParams = "pd.DeviceCfg LIKE '%Radeon%' AND pd.DeviceCfg LIKE '%AMD%'"; break;
    }
    switch (demand) {
        case "office": demandParams = "p.ProdName LIKE '%Laptop%' AND p.ProdName NOT LIKE '%gaming%'"; break;
        case "gaming": demandParams = "p.ProdName LIKE '%Laptop%' AND p.ProdName LIKE '%gaming%'"; break;
    }
    if (brand) {
        const brandId = await db.query('SELECT Id FROM Brands WHERE BrandName Like ?', [`%${brand}%`]);
        brandParams = `p.BrandId = ${brandId[0].Id}`;
    }
    if (count) {countParams = parseInt(count) + 12;}

    try {
        const getCategory = await db.query('SELECT Id FROM Categories WHERE Slugs = ?', [slugs]);

        if (getCategory?.length > 0) {
            const sqlCount = ` SELECT COUNT(*) AS Total FROM Product p JOIN ProductDetails pd ON p.Id = pd.ProdId 
                WHERE p.CateId = ? ${priceParams ? `AND ${priceParams}` : ''} ${cpuParams ? `AND ${cpuParams}` : ''}
                ${ramParams ? `AND ${ramParams}` : ''} ${vgaParams ? `AND ${vgaParams}` : ''}
                ${demandParams ? `AND ${demandParams}` : ''} ${brandParams ? `AND ${brandParams}` : ''}
            `;

            const sqlProduct = `SELECT p.*, pd.DeviceCfg, (p.Price - (p.Price * (p.Discount / 100))) AS FinalPrice,
                (SELECT COUNT(*) FROM Product WHERE CateId = ?) AS total FROM Product p JOIN ProductDetails pd 
                ON p.Id = pd.ProdId WHERE p.CateId = ? ${priceParams ? `AND ${priceParams}` : ''} 
                ${cpuParams ? `AND ${cpuParams}` : ''} ${ramParams ? `AND ${ramParams}` : ''} 
                ${vgaParams ? `AND ${vgaParams}` : ''} ${demandParams ? `AND ${demandParams}` : ''} 
                ${brandParams ? `AND ${brandParams}` : ''} ORDER BY ${sortParams} LIMIT ${countParams ? `${countParams}` : 12}`;

            const [product, totalProduct] = await db.queryAll([
                { sql: sqlProduct, params: [getCategory[0].Id, getCategory[0].Id] },
                { sql: sqlCount, params: [getCategory[0].Id] }
            ]);

            product.forEach(prdItem => {
                const simpleDeviceCfg = extractSimpleDeviceCfg(prdItem.DeviceCfg);
                prdItem.DeviceCfg = simpleDeviceCfg;
                prdItem.Total = product.length;
                prdItem.FinalPrice = parseFloat(prdItem.FinalPrice).toFixed(0);
            });

            return res.render("product/index", { product, totalProduct });
        } else {
            const sql = `SELECT p.*, pd.DeviceCfg, pd.Content, (p.Price - (p.Price * (p.Discount / 100))) AS FinalPrice 
                FROM Product p JOIN ProductDetails pd ON p.Id = pd.ProdId WHERE p.Slugs = ?`;
            const getProduct = await db.query(sql, [slugs]);

            if (getProduct?.length > 0) {
                getProduct[0].FinalPrice = parseFloat(getProduct[0].FinalPrice).toFixed(0);

                return res.render("product/details", { product: getProduct[0] });
            }
        }

        return res.status(404).sendFile(path.join(__dirname, '..', 'views', 'layouts', 'error.html'));
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
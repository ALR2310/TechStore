const express = require('express');
const router = express.Router();
const db = require('../configs/dbConnect.js');
const myUtils = require("../utils/myUtils");

router.get('/', async (req, res) => {
    try {
        // Danh mục sản phẩm muốn lấy
        const categories = ["Laptop Gaming", "Laptop", "PC"];
        const queries = categories.map(category => ({
            sql: `
                SELECT 
                    p.*, 
                    pd.DeviceCfg,
                    CAST(p.Price - (p.Price * (p.Discount / 100)) AS INTEGER) AS FinalPrice, 
                    c.CateName, 
                    c.Slugs AS CateSlugs,
                    ROUND(IFNULL(AVG(pv.Rating), 0), 1) AS AverageRating,
                    COUNT(pv.Id) AS TotalRating,
                    FLOOR((ROW_NUMBER() OVER (ORDER BY p.id) - 1) / 5) + 1 AS GroupNumber 
                FROM Product p 
                    JOIN Categories c ON p.CateId = c.Id 
                    JOIN ProductDetails pd ON p.Id = pd.ProdId
                    LEFT JOIN ProductReviews pv ON p.Id = pv.ProdId
                WHERE 
                    c.CateName = ? AND 
                    p.Status = "Active" 
                GROUP BY p.Id, pd.DeviceCfg
                LIMIT 12`,
            params: [category]
        }));

        const results = await db.queryAll(queries);

        // Nhóm các sản phẩm từ trường GroupNumber
        const groupBy = (products) =>
            Object.values(products.reduce((acc, prd) => {
                prd.DeviceCfg = myUtils.extractSimpleDeviceCfg(prd.DeviceCfg);
                acc[prd.GroupNumber] = acc[prd.GroupNumber] || [];
                acc[prd.GroupNumber].push(prd);
                return acc;
            }, {}));

        // Tạo một danh sách các nhóm sản phẩm theo từng danh mục và loại bỏ các nhóm rỗng
        const productsGroupedByCategory = results.map((products, index) => ({
            category: categories[index],
            products: groupBy(products)
        })).filter(group => group.products.length > 0);


        // Lấy ra danh sách các sản phẩm nổi bật ngẫu nhiên
        const rdmProduct = await db.query(`
            SELECT 
                p.*, 
                    pd.DeviceCfg,
                    CAST(p.Price - (p.Price * (p.Discount / 100)) AS INTEGER) AS FinalPrice, 
                    ROUND(IFNULL(AVG(pv.Rating), 0), 1) AS AverageRating,
                    COUNT(pv.Id) AS TotalRating
            FROM Product p
                JOIN ProductDetails pd ON p.Id = pd.ProdId
                LEFT JOIN ProductReviews pv ON p.Id = pv.ProdId
            WHERE p.Status = "Active"
            GROUP BY p.Id, pd.DeviceCfg
            LIMIT 12
            `);

        rdmProduct.forEach((prdItem) => {
            prdItem.DeviceCfg = myUtils.extractSimpleDeviceCfg(prdItem.DeviceCfg);
        });

        return res.render('home/index', { categories: productsGroupedByCategory, rdmProduct });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ success: false, message: 'Lỗi máy chủ', data: e });
    }
});

router.get('/tim-kiem', async (req, res) => {
    const { name, sort, price, count } = req.query;

    let sortParams, priceParams, countParams;

    switch (sort) {
        case 'newest': sortParams = "p.AtUpdate DESC"; break;
        case 'oldest': sortParams = "p.AtUpdate ASC"; break;
        case 'asc': sortParams = "FinalPrice ASC"; break;
        case 'desc': sortParams = "FinalPrice DESC"; break;
        default: sortParams = "p.AtUpdate DESC"; break;
    }
    switch (price) {
        case '15': priceParams = "p.Price <= 15000000"; break;
        case '15-20': priceParams = "p.Price BETWEEN 15000000 AND 20000000"; break;
        case '20-25': priceParams = "p.Price BETWEEN 20000000 AND 25000000"; break;
        case '25-30': priceParams = "p.Price BETWEEN 25000000 AND 30000000"; break;
        case '30': priceParams = "p.Price >= 30000000"; break;
    }
    if (count) countParams = parseInt(count) + 12;

    try {
        const sql = `
            SELECT 
                p.*, 
                pd.DeviceCfg, 
                CAST(p.Price - (p.Price * (p.Discount / 100)) AS INTEGER) AS FinalPrice, 
                (SELECT COUNT(*) FROM Product WHERE ProdName LIKE ?) AS TotalProduct,
                ROUND(IFNULL(AVG(pv.Rating), 0), 1) AS AverageRating,
                COUNT(pv.Id) AS TotalRating
            FROM Product p 
                JOIN ProductDetails pd ON p.Id = pd.ProdId 
                LEFT JOIN ProductReviews pv ON p.Id = pv.ProdId
            WHERE 
                p.ProdName LIKE ? 
                ${priceParams ? `AND ${priceParams}` : ''} 
                AND p.Status = ? 
            GROUP BY p.Id, pd.DeviceCfg
            ORDER BY ${sortParams} 
            LIMIT ${countParams ? `${countParams}` : 12}`;

        const products = await db.query(sql, [`%${name}%`, `%${name}%`, "Active"]);

        products.forEach(prdItem => {
            prdItem.DeviceCfg = myUtils.extractSimpleDeviceCfg(prdItem.DeviceCfg);
            prdItem.CurrentTotalProduct = products.length;
        });

        return res.render('home/search', { product: products });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ success: false, message: 'Lỗi máy chủ', data: e });
    }
});

router.get('/tim-kiem/preview', async (req, res) => {
    const { value } = req.query;

    try {
        const sql = `SELECT p.*, CAST(p.Price - (p.Price * (p.Discount / 100)) AS INTEGER) AS FinalPrice 
            FROM Product p WHERE ProdName LIKE ? AND p.Status = "Active" ORDER BY p.AtUpdate DESC LIMIT 6`;
        const product = await db.query(sql, [`%${value}%`]);
        return res.status(200).json({ success: true, message: 'Lấy dữ liệu thành công', data: product });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ success: false, message: 'Lỗi máy chủ', data: e });
    }
});

module.exports = router;
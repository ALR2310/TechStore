const express = require("express");
const router = express.Router();
const db = require('../configs/dbConnect');
const upload = require('../middleware/upload');
const path = require("path");
const fs = require("fs");

router.get('/', (req, res) => {
    res.render('admin/index', { layout: 'admin' });
});

router.get('/product/create', async (req, res) => {
    try {
        const [categories, brands, brandSeries, tags] = await db.queryAll([
            { sql: "SELECT * FROM Categories" },
            { sql: "SELECT * FROM Brands" },
            { sql: "SELECT * FROM BrandSeries" },
            { sql: "SELECT * FROM Tags" },
        ]);

        const uniqueTags = Array.from(new Set(tags.map(tag => tag.TagName.toLowerCase())))
            .map(tagName => {
                return tags.find(tag => tag.TagName.toLowerCase() === tagName);
            });
        return res.status(200).render('admin/product/create', { layout: 'admin', categories, brands, brandSeries, tags: uniqueTags });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ success: false, message: 'Lỗi máy chủ', data: e });
    }
});

router.post('/product/create', upload.single('Image'), async (req, res) => {
    const { CateId, BrandId, BrandSeriesId, ProdName, Quantity, Price, Discount, Slugs, AtCreate, DeviceCfg, Content, Tags } = req.body;
    const absoImagePath = req.file ? req.file.path : null;
    let relaImagePath = path.relative(path.join(__dirname, '..', 'assets'), absoImagePath)

    if (absoImagePath && Slugs) {
        const extname = path.extname(req.file.originalname);
        const newFileName = `${Slugs}${extname}`;
        const newFilePath = path.join(path.dirname(absoImagePath), newFileName);

        fs.renameSync(absoImagePath, newFilePath);
        relaImagePath = path.relative(path.join(__dirname, '..', 'assets'), newFilePath);
    }

    try {
        let sql = `INSERT INTO Product(CateId, BrandId, BrandSeriesId, Image, ProdName, Quantity, Price, Discount, Slugs, AtCreate)
            VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        let params = [CateId, BrandId, BrandSeriesId, relaImagePath, ProdName, Quantity, Price, Discount, Slugs, AtCreate];
        const result = await db.query(sql, params);

        params = [result.insertId, DeviceCfg, Content, AtCreate];
        await db.query('INSERT INTO ProductDetails(ProdId, DeviceCfg, Content, AtCreate) VALUES(?, ?, ?, ?)', params);

        if (Tags) {
            const tagsArray = Tags.split(',').map(tag => tag.trim());
            const tagQueries = tagsArray.map(tagName => {
                return { sql: 'INSERT INTO Tags(ProdId, TagName) VALUES(?, ?)', params: [result.insertId, tagName] };
            });
            await db.queryAll(tagQueries);
        }

        return res.status(200).json({ success: true, message: "Thêm sản phẩm thành công" });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ success: false, message: 'Lỗi máy chủ', data: e });
    }
});

router.post("/categories/create", async (req, res) => {
    const { CateName } = req.body;

    if (!CateName) return res.status(400).json({ success: false, message: 'Vui lòng nhập đầy đủ thông tin' });

    try {
        const result = await db.query("INSERT INTO Categories (CateName) VALUES (?)", [CateName]);
        return res.status(200).json({ success: true, message: "Thêm danh mục thành công", data: result });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ success: false, message: 'Lỗi máy chủ', data: e });
    }
});

router.post("/brands/create", async (req, res) => {
    const { BrandName } = req.body;

    if (!BrandName) return res.status(400).json({ success: false, message: 'Vui lòng nhập đầy đủ thông tin' });

    try {
        const result = await db.query("INSERT INTO Brands (BrandName) VALUES (?)", [BrandName]);
        return res.status(200).json({ success: true, message: "Thêm thương hiệu thành công", data: result });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ success: false, message: 'Lỗi máy chủ', data: e });
    }
});

router.post("/brand-series/create", async (req, res) => {
    const { BrandId, SeriesName } = req.body;

    if (!BrandId || !SeriesName) return res.status(400).json({ success: false, message: 'Vui lòng nhập đầy đủ thông tin' });

    try {
        const result = await db.query("INSERT INTO BrandSeries (BrandId, SeriesName) VALUES (?, ?)", [BrandId, SeriesName]);
        return res.status(200).json({ success: true, message: "Thêm dòng thương hiệu thành công", data: result });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ success: false, message: 'Lỗi máy chủ', data: e });
    }
});

module.exports = router;

const express = require("express");
const router = express.Router();
const db = require("../configs/dbConnect");
const path = require('path');
const myUtils = require("../utils/myUtils");


router.get("/:slugs", async (req, res) => {
    const slugs = req.params.slugs;
    const { sort, price, cpu, ram, vga, demand, brand, count } = req.query;

    let sortParams, priceParams, cpuParams, ramParams, vgaParams, demandParams, brandParams, countParams;

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
        const brandId = (await db.query('SELECT Id FROM Brands WHERE BrandName Like ?', [`%${brand}%`]))[0].Id;
        brandParams = `p.BrandId = ${brandId[0].Id}`;
    }
    if (count) countParams = parseInt(count) + 12;

    try {
        const category = await db.query('SELECT Id FROM Categories WHERE Slugs = ?', [slugs]);

        if (category?.length > 0) {
            const sqlProduct = `
                SELECT 
                    p.*, 
                    pd.DeviceCfg, 
                    CAST(p.Price - (p.Price * (p.Discount / 100)) AS INTEGER) AS FinalPrice, 
                    (SELECT COUNT(*) FROM Product WHERE CateId = ?) AS TotalProduct,
                    ROUND(IFNULL(AVG(pv.Rating), 0), 1) AS AverageRating,
                    COUNT(pv.Id) AS TotalRating
                FROM Product p 
                    JOIN ProductDetails pd ON p.Id = pd.ProdId 
                    LEFT JOIN ProductReviews pv ON p.Id = pv.ProdId
                WHERE 
                    p.CateId = ? 
                    ${priceParams ? `AND ${priceParams}` : ''} 
                    ${cpuParams ? `AND ${cpuParams}` : ''} 
                    ${ramParams ? `AND ${ramParams}` : ''} 
                    ${vgaParams ? `AND ${vgaParams}` : ''} 
                    ${demandParams ? `AND ${demandParams}` : ''} 
                    ${brandParams ? `AND ${brandParams}` : ''} 
                    AND p.Status = ? 
                GROUP BY p.Id, pd.DeviceCfg
                ORDER BY ${sortParams} 
                LIMIT ${countParams ? `${countParams}` : 12}`;

            // Lấy ra danh sách sản phẩm và tổng số lượng sản phẩm
            const product = await db.query(sqlProduct, [category[0].Id, category[0].Id, "Active"]);

            product.forEach(prdItem => {
                prdItem.DeviceCfg = myUtils.extractSimpleDeviceCfg(prdItem.DeviceCfg);
                prdItem.CurrentTotalProduct = product.length;
            });

            return res.render("product/index", { product });
        } else {
            // Lấy ra sản phẩm và mô tả chi tiết sản phẩm
            const sql = `SELECT p.*, pd.DeviceCfg, pd.Content, (p.Price - (p.Price * (p.Discount / 100))) AS FinalPrice 
                FROM Product p JOIN ProductDetails pd ON p.Id = pd.ProdId WHERE p.Slugs = ? AND p.Status = ?`;

            const product = await db.query(sql, [slugs, "Active"]);

            if (product?.length > 0) {
                product[0].SimpleDeviceCfg = myUtils.extractSimpleDeviceCfg(product[0].DeviceCfg);
                product[0].FinalPrice = parseFloat(product[0].FinalPrice).toFixed(0);

                // Lấy ra danh sách sản phẩm đã xem từ cookie
                let viewedProducts = req.cookies.viewed || [];

                // Nếu danh sách rỗng và người dùng đã đăng nhập thì lấy từ database ra
                if (viewedProducts.length === 0 && req.user) {
                    const sqlViewedProducts = `SELECT ProdId FROM ProductViewed WHERE UserId = ? AND Status = 'Active' 
                        ORDER BY AtCreate DESC LIMIT 3`;
                    const results = await db.query(sqlViewedProducts, [req.user.Id]);

                    viewedProducts = results.map(row => row.ProdId);

                    res.cookie('viewed', viewedProducts, { maxAge: 7 * 24 * 60 * 60 * 1000 });
                }

                // Thêm sản phẩm vào danh sách đã xem
                if (!viewedProducts.includes(product[0].Id)) {
                    viewedProducts.unshift(product[0].Id);

                    // Giới hạn sản phẩm lưu trong cookie
                    if (viewedProducts.length > 3) { viewedProducts.pop(); }

                    res.cookie('viewed', viewedProducts, { maxAge: 7 * 24 * 60 * 60 * 1000 });

                    // Nếu đã đăng nhập thì lưu vào database
                    if (req.user) {
                        const checkResult = await db.query(`SELECT COUNT(*) as count FROM ProductViewed WHERE ProdId = ? AND UserId = ?`,
                            [product[0].Id, req.user.Id]);

                        if (checkResult.count > 0)
                            await db.query(`UPDATE ProductViewed SET AtCreate = ? WHERE ProdId = ? AND UserId = ?`,
                                ['CURRENT_TIMESTAMP', product[0].Id, req.user.Id]);
                        else
                            await db.query(`INSERT INTO ProductViewed (ProdId, UserId) VALUES (?, ?)`, [product[0].Id, req.user.Id]);
                    }
                }

                // query lấy ra các sản phẩm tương tự
                const sqlSimilar = `SELECT p.*, CAST(p.Price - (p.Price * (p.Discount / 100)) AS INTEGER) AS FinalPrice, 
                    ROUND(IFNULL(AVG(pv.Rating), 0), 1) AS AverageRating, COUNT(pv.Id) AS TotalRating FROM Product p 
                    LEFT JOIN ProductReviews pv ON p.Id = pv.ProdId WHERE p.CateId = ? AND p.Id != ? AND p.Status = ? 
                    GROUP BY p.Id ORDER BY RANDOM() LIMIT 3;`;

                // query lấy ra sản phẩm đã xem
                const placeholders = viewedProducts.map(() => '?').join(',');
                const sqlViewed = `SELECT p.*, CAST(p.Price - (p.Price * (p.Discount / 100)) AS INTEGER) AS FinalPrice,
                     ROUND(IFNULL(AVG(pv.Rating), 0), 1) AS AverageRating, COUNT(pv.Id) AS TotalRating FROM Product p 
                     LEFT JOIN ProductReviews pv ON p.Id = pv.ProdId WHERE p.Id IN (${placeholders}) AND p.Status = ? GROUP BY p.Id LIMIT 3`;

                // query lấy ra đánh giá của sản phẩm
                const sqlRating = `SELECT SUM(CASE WHEN Rating = 1 THEN 1 ELSE 0 END) AS Rating1, 
                    SUM(CASE WHEN Rating = 2 THEN 1 ELSE 0 END) AS Rating2, SUM(CASE WHEN Rating = 3 THEN 1 ELSE 0 END) AS Rating3, 
                    SUM(CASE WHEN Rating = 4 THEN 1 ELSE 0 END) AS Rating4, SUM(CASE WHEN Rating = 5 THEN 1 ELSE 0 END) AS Rating5,
                    ROUND(AVG(Rating), 1) AS AverageRating, COUNT(*) as Total FROM ProductReviews WHERE ProdId = ? AND Status = ?`;

                // query lấy ra đánh giá và bình luận của người dùng trên sản phẩm
                const sqlReview = `SELECT * FROM ProductReviews WHERE ProdId = ? AND Status = ? ORDER BY AtCreate DESC`;

                // Thực hiện các truy vấn
                const [productSimilar, productViewed, productRating, productReview] = await db.queryAll([
                    { sql: sqlSimilar, params: [product[0].CateId, product[0].Id, "Active"] },
                    { sql: sqlViewed, params: [...viewedProducts, "Active"] },
                    { sql: sqlRating, params: [product[0].Id, "Active"] },
                    { sql: sqlReview, params: [product[0].Id, "Active"] }
                ]);

                // Tính phần trăm tiến trình đánh giá sản phẩm
                if (productRating[0].Total > 0) {
                    productRating[0].Percentage5 = (productRating[0].Rating5 / productRating[0].Total) * 100;
                    productRating[0].Percentage4 = (productRating[0].Rating4 / productRating[0].Total) * 100;
                    productRating[0].Percentage3 = (productRating[0].Rating3 / productRating[0].Total) * 100;
                    productRating[0].Percentage2 = (productRating[0].Rating2 / productRating[0].Total) * 100;
                    productRating[0].Percentage1 = (productRating[0].Rating1 / productRating[0].Total) * 100;
                } else {
                    productRating[0].Percentage5 = productRating[0].Percentage4 = productRating[0].Percentage3 =
                        productRating[0].Percentage2 = productRating[0].Percentage1 = 0;
                }

                // Định dạng lại dữ liệu đánh giá
                const formattedRating = {
                    Average: productRating[0].AverageRating || 0,
                    Total: productRating[0].Total,
                    Rating: formatProductRating(productRating[0])
                };

                return res.render("product/details", {
                    product: product[0], productSimilar, productViewed, productRating: formattedRating, productReview
                });
            }
        }

        return res.status(404).sendFile(path.join(__dirname, '..', 'views', 'layouts', 'error.html'));
    } catch (e) {
        console.error(e);
        return res.status(500).json({ success: false, message: 'Lỗi máy chủ', data: e });
    }
});

router.post("/danh-gia", async (req, res) => {
    const { rating, comment, userName, productId } = req.body;

    if (!rating || !comment || !productId)
        return res.status(400).json({ success: false, message: 'Vui lòng nhập đầy đủ thông tin' });

    try {
        const sql = "INSERT INTO ProductReviews(ProdId, UserId, UserName, Rating, Comment) VALUES (?, ?, ?, ?, ?)";
        await db.query(sql, [productId, req.user?.Id, userName, rating, comment]);

        return res.status(201).json({ success: true, message: 'Đánh giá sản phẩm thành công' });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ success: false, message: 'Lỗi máy chủ', data: e });
    }
});

// Hàm định dạng lại dữ liệu trả về của productRating
const formatProductRating = (ratingData) => {
    return [
        { index: 5, total: ratingData.Rating5, percent: ratingData.Percentage5 },
        { index: 4, total: ratingData.Rating4, percent: ratingData.Percentage4 },
        { index: 3, total: ratingData.Rating3, percent: ratingData.Percentage3 },
        { index: 2, total: ratingData.Rating2, percent: ratingData.Percentage2 },
        { index: 1, total: ratingData.Rating1, percent: ratingData.Percentage1 }
    ];
};

module.exports = router;
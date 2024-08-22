const express = require("express");
const router = express.Router();
const db = require("../configs/dbConnect");
const myUtils = require("../utils/myUtils");
const path = require("path");


router.get('/', async (req, res) => {
    if (!req.user)
        return res.status(404).sendFile(path.join(__dirname, '..', 'views', 'layouts', 'error.html'));

    try {
        const sql = `
            SELECT 
                p.*,
                pd.DeviceCfg,
                CAST(p.Price - (p.Price * (p.Discount / 100)) AS INTEGER) AS FinalPrice,
                ROUND(IFNULL(pr.AverageRating, 0), 1) AS AverageRating,
                IFNULL(pr.TotalRating, 0) AS TotalRating
            FROM ProductViewed pv
                JOIN Product p ON pv.ProdId = p.Id
                JOIN ProductDetails pd ON p.Id = pd.ProdId
                LEFT JOIN (
                    SELECT ProdId, AVG(Rating) AS AverageRating, COUNT(Id) AS TotalRating
                    FROM ProductReviews
                    GROUP BY ProdId
                ) pr ON p.Id = pr.ProdId
            WHERE pv.UserId = ?
            GROUP BY p.Id, pd.DeviceCfg
            ORDER BY pv.AtCreate DESC;`;
        const productViewed = await db.query(sql, [req.user.Id]);

        productViewed.forEach(prdItem => {
            prdItem.DeviceCfg = myUtils.extractSimpleDeviceCfg(prdItem.DeviceCfg);
        });

        return res.render('user/index', { productViewed });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ success: false, message: 'Lỗi máy chủ', data: e });
    }
});

router.post('/update', async (req, res) => {
    const { fullName, gender, phoneNumber, email, dateOfBirth } = req.body;

    if (!fullName || !gender || !phoneNumber || !email || !dateOfBirth)
        return res.status(400).json({ success: false, message: "Vui lòng điền đầy đủ thông tin" });
    else if (!req.user)
        return res.status(404).sendFile(path.join(__dirname, '..', 'views', 'layouts', 'error.html'));

    try {
        await db.query(`UPDATE User SET Email = ? WHERE Id = ?`, [email, req.user.Id]);
        await db.query(`UPDATE UserInfo SET FullName = ?, PhoneNumber = ?, Gender = ?, DoB = ? WHERE UserId = ?`,
            [fullName, phoneNumber, gender, dateOfBirth, req.user.Id]);
        return res.status(200).json({ success: true, message: "Cập nhật thông tin thành công" });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ success: false, message: 'Lỗi máy chủ', data: e });
    }
});

module.exports = router;
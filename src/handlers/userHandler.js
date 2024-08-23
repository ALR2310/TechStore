const express = require("express");
const router = express.Router();
const db = require("../configs/dbConnect");
const myUtils = require("../utils/myUtils");
const path = require("path");


router.get('/', async (req, res) => {
    if (!req.user)
        return res.status(404).sendFile(path.join(__dirname, '..', 'views', 'layouts', 'error.html'));

    try {
        const sqlProductViewed = `
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
            WHERE pv.UserId = ? AND pv.Status = ?
            GROUP BY p.Id, pd.DeviceCfg
            ORDER BY pv.AtCreate DESC;`;

        const sqlShippingAddress = `SELECT * FROM ShippingAddress WHERE UserId = ? AND Status = ? ORDER BY IsDefault DESC`;

        // Thực thi truy vấn
        const [productViewed, shippingAddress] = await db.queryAll([
            { sql: sqlProductViewed, params: [req.user.Id, "Active"] },
            { sql: sqlShippingAddress, params: [req.user.Id, "Active"] }
        ]);

        productViewed.forEach(prdItem => {
            prdItem.DeviceCfg = myUtils.extractSimpleDeviceCfg(prdItem.DeviceCfg);
        });

        return res.render('user/index', { productViewed, shippingAddress });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ success: false, message: 'Lỗi máy chủ', data: e });
    }
});

router.post('/profile-update', async (req, res) => {
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

router.post('/address-create', async (req, res) => {
    const { fullName, phoneNumber, AddressLine, AddressType } = req.body;

    if (!fullName || !phoneNumber || !AddressLine || !AddressType)
        return res.status(400).json({ success: false, message: "Vui lòng điền đầy đủ thông tin" });
    else if (!req.user)
        return res.status(404).sendFile(path.join(__dirname, '..', 'views', 'layouts', 'error.html'));

    try {
        // Kiểm tra xem đã có địa chỉ mặt định tồn tại chưa
        let sql = `SELECT * FROM ShippingAddress WHERE UserId = ? AND IsDefault = ? AND Status = ?`;
        const result = await db.query(sql, [req.user.Id, 1, "Active"]);

        // Thêm địa chỉ mới vào bảng
        if (result.length > 0)
            sql = `INSERT INTO ShippingAddress(UserId, FullName, PhoneNumber, AddressLine, AddressType) VALUES (?, ?, ?, ?, ?)`;
        else
            sql = `INSERT INTO ShippingAddress(UserId, FullName, PhoneNumber, AddressLine, AddressType, IsDefault) VALUES (?, ?, ?, ?, ?, 1)`;

        await db.query(sql, [req.user.Id, fullName, phoneNumber, AddressLine, AddressType]);
        return res.status(200).json({ success: true, message: "Thêm địa chỉ mới thành công" });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ success: false, message: 'Lỗi máy chủ', data: e });
    }
});

router.post('/address-default', async (req, res) => {
    const { Id } = req.body;

    if (!Id)
        return res.status(400).json({ success: false, message: "Vui lòng điền đầy đủ thông tin" });
    else if (!req.user)
        return res.status(404).sendFile(path.join(__dirname, '..', 'views', 'layouts', 'error.html'));

    try {
        await db.query(`UPDATE ShippingAddress SET IsDefault = 1 WHERE Id = ?`, [Id]);
        return res.status(200).json({ success: true, message: "Đặt địa chỉ mặt định thành công" });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ success: false, message: 'Lỗi máy chủ', data: e });
    }
});

router.post('/address-delete', async (req, res) => {
    const { Id } = req.body;

    if (!Id)
        return res.status(400).json({ success: false, message: "Vui lòng điền đầy đủ thông tin" });
    else if (!req.user)
        return res.status(404).sendFile(path.join(__dirname, '..', 'views', 'layouts', 'error.html'));

    try {
        await db.query(`UPDATE ShippingAddress SET IsDefault = 0, Status = ? WHERE Id = ?`, ["Inactive", Id]);
        return res.status(200).json({ success: true, message: "Xóa địa chỉ thành công" });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ success: false, message: 'Lỗi máy chủ', data: e });
    }
});

module.exports = router;
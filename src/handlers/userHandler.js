const express = require("express");
const router = express.Router();
const db = require("../configs/dbConnect");
const myUtils = require("../utils/myUtils");
const { checkUser } = require('../middleware/authenticate');


router.get('/', checkUser, async (req, res) => {
    const { ordtype, q } = req.query;

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

        const sqlAddress = `SELECT * FROM Address WHERE UserId = ? AND Status = ? ORDER BY IsDefault DESC`;

        // Thực thi truy vấn
        const [productViewed, address] = await db.queryAll([
            { sql: sqlProductViewed, params: [req.user.Id, "Active"] },
            { sql: sqlAddress, params: [req.user.Id, "Active"] }
        ]);

        productViewed.forEach(prdItem => {
            prdItem.DeviceCfg = myUtils.extractSimpleDeviceCfg(prdItem.DeviceCfg);
        });

        // Lấy thông tin đơn hàng
        let ordersSql = `SELECT * FROM Orders WHERE UserId = ?`;
        let ordersParams = [req.user.Id];
        const searchKey = q?.trim().replace('#', '');

        if (q) { ordersSql += ` AND Code LIKE "%${searchKey}%"`; }

        if (ordtype) {
            const statusMap = { "2": "Processing", "3": "Delivering", "4": "Completed", "5": "Cancelled" };
            if (statusMap[ordtype]) { ordersSql += ` AND Status = ?`; ordersParams.push(statusMap[ordtype]); }
        }

        ordersSql += ` ORDER BY AtCreate DESC`;

        // Thực hiện truy vấn lấy đơn hàng
        const orders = await db.query(ordersSql, ordersParams);

        // Thực hiện truy vấn lấy sản phẩm của đơn hàng
        const orderItemsQueries = orders.map(order => ({
            sql: `SELECT oi.OrdId, oi.ProdId, oi.Quantity, p.Image, p.ProdName, 
                CAST(p.Price - (p.Price * (p.Discount / 100)) AS INTEGER) AS FinalPrice FROM OrderItems oi
                JOIN Product p ON oi.ProdId = p.Id WHERE oi.OrdId = ?`,
            params: [order.Id]
        }));
        const orderItemsResults = await db.queryAll(orderItemsQueries);

        // Thực hiện truy vấn lấy địa chỉ nhận hàng
        const orderAddressQueries = orders.map(order => ({
            sql: `SELECT * FROM Address WHERE Id = ? AND Status = ?`, params: [order.AdrId, "Active"]
        }));
        const orderAddressResults = await db.queryAll(orderAddressQueries);

        // Tạo mảng các đơn hàng với thông tin chi tiết
        const ordersResult = orders.map((order, index) => ({
            ...order,
            OrderItems: orderItemsResults[index],
            AddressInfo: orderAddressResults[index]
        }));

        return res.render('user/index', { productViewed, address, orders: ordersResult });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ success: false, message: 'Lỗi máy chủ', data: e });
    }
});

router.post('/profile-update', checkUser, async (req, res) => {
    const { fullName, gender, phoneNumber, email, dateOfBirth } = req.body;

    if (!fullName || !gender || !phoneNumber || !email || !dateOfBirth)
        return res.status(400).json({ success: false, message: "Vui lòng điền đầy đủ thông tin" });

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

router.post('/address-create', checkUser, async (req, res) => {
    const { fullName, phoneNumber, AddressLine, AddressType } = req.body;

    if (!fullName || !phoneNumber || !AddressLine || !AddressType)
        return res.status(400).json({ success: false, message: "Vui lòng điền đầy đủ thông tin" });

    try {
        // Kiểm tra xem đã có địa chỉ mặt định tồn tại chưa
        let sql = `SELECT * FROM Address WHERE UserId = ? AND IsDefault = ? AND Status = ?`;
        const result = await db.query(sql, [req.user.Id, 1, "Active"]);

        // Thêm địa chỉ mới vào bảng
        if (result.length > 0)
            sql = `INSERT INTO Address(UserId, FullName, PhoneNumber, AddressLine, AddressType) VALUES (?, ?, ?, ?, ?)`;
        else
            sql = `INSERT INTO Address(UserId, FullName, PhoneNumber, AddressLine, AddressType, IsDefault) VALUES (?, ?, ?, ?, ?, 1)`;

        await db.query(sql, [req.user.Id, fullName, phoneNumber, AddressLine, AddressType]);
        return res.status(200).json({ success: true, message: "Thêm địa chỉ mới thành công" });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ success: false, message: 'Lỗi máy chủ', data: e });
    }
});

router.post('/address-default', checkUser, async (req, res) => {
    const { Id } = req.body;

    if (!Id)
        return res.status(400).json({ success: false, message: "Vui lòng điền đầy đủ thông tin" });

    try {
        await db.query(`UPDATE Address SET IsDefault = 1 WHERE Id = ?`, [Id]);
        return res.status(200).json({ success: true, message: "Đặt địa chỉ mặt định thành công" });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ success: false, message: 'Lỗi máy chủ', data: e });
    }
});

router.post('/address-delete', checkUser, async (req, res) => {
    const { Id } = req.body;

    if (!Id)
        return res.status(400).json({ success: false, message: "Vui lòng điền đầy đủ thông tin" });

    try {
        await db.query(`UPDATE Address SET IsDefault = 0, Status = ? WHERE Id = ?`, ["Inactive", Id]);
        return res.status(200).json({ success: true, message: "Xóa địa chỉ thành công" });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ success: false, message: 'Lỗi máy chủ', data: e });
    }
});

router.post('/order-create', checkUser, async (req, res) => {
    const { addressId, totalPrice, cartItems } = req.body;

    const orderCode = await generateOrderCode(db);

    await db.query('BEGIN TRANSACTION');

    try {
        const result = await db.query(`INSERT INTO Orders(Code, UserId, AdrId, TotalPrice) VALUES (?, ?, ?, ?)`,
            [orderCode, req.user.Id, addressId, totalPrice]);

        const combinedQueries = cartItems.flatMap(item => [
            {
                sql: `INSERT INTO OrderItems(OrdId, ProdId, Quantity) VALUES (?, ?, ?)`,
                params: [result.insertId, item.prodId, item.quantity]
            },
            {
                sql: `UPDATE Cart SET Status = ? WHERE Status = ?`,
                params: ["Inactive", "Active"]
            }
        ]);

        await db.queryAll(combinedQueries);
        await db.query('COMMIT');

        return res.status(201).json({ success: true, message: 'Tạo đơn hàng thành công' });
    } catch (e) {
        await db.query('ROLLBACK');
        console.error(e);
        return res.status(500).json({ success: false, message: 'Lỗi máy chủ', data: e });
    }
});


module.exports = router;


const generateOrderCode = async (db) => {
    let code, isUnique = false;

    while (!isUnique) {
        code = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
        const rows = await db.query('SELECT 1 FROM Orders WHERE Code = ?', [code]);
        if (rows.length === 0) isUnique = true;
    }

    return code;
};
const db = require('../configs/dbConnect');
const path = require("path");

const authenticate = {
    // Hàm kiểm tra token và gán user vào req và res.locals
    checkToken: async (req, res, next) => {
        try {
            const authToken = req.cookies.authToken;
            const checkAuthToken = await db.query('SELECT * FROM authtoken WHERE Token = ?', [authToken]);

            const sqlUser = `SELECT u.*, ui.FullName, ui.PhoneNumber, ui.Gender, ui.DoB, 
                SUM(CASE WHEN c.Status = 'Active' THEN 1 ELSE 0 END) AS CartCount
                FROM User u JOIN UserInfo ui ON u.Id = ui.UserId LEFT JOIN Cart c ON u.Id = c.UserId
                WHERE u.Id = ? GROUP BY u.Id, ui.FullName, ui.PhoneNumber, ui.Gender, ui.DoB;`;
            const user = await db.query(sqlUser, [checkAuthToken[0]?.UserId]);

            req.user = user[0];
            res.locals.user = req.user;

            if (req.path.startsWith('/admin'))
                if (!req.user || req.user?.Role != 'Admin')
                    return res.status(403).sendFile(path.join(__dirname, '..', 'views', 'layouts', 'error.html'));
            next();
        } catch (e) {
            console.error(e);
            res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
        }
    },

    // Hàm kiểm tra xem người dùng đã đăng nhập chưa
    checkUser: (req, res, next) => {
        if (!req.user)
            return res.status(404).sendFile(path.join(__dirname, '..', 'views', 'layouts', 'error.html'));
        next();
    }
};

module.exports = authenticate;
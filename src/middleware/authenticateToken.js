const db = require('../configs/dbConnect');
const path = require("path");

const authenticateToken = async (req, res, next) => {
    try {
        const authToken = req.cookies.authToken;
        const getAuthToken = await db.query('SELECT * FROM authtoken WHERE Token = ?', [authToken]);
        const user = await db.query('SELECT * FROM user WHERE Id = ?', [getAuthToken[0]?.UserId]);

        req.user = user[0];
        res.locals.user = req.user;
        res.locals.userInfo = (await db.query("SELECT * FROM UserInfo WHERE UserId = ?", [req?.user?.Id]))[0];

        if (req.path.startsWith('/admin'))
            if (!req.user || req.user?.Role != 'Admin')
                return res.status(403).sendFile(path.join(__dirname, '..', 'views', 'layouts', 'error.html'));
        next();
    } catch (e) {
        console.error(e);
        res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
    }
};

module.exports = authenticateToken;
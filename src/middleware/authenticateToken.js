const db = require('../configs/dbConnect');

const authenticateToken = async (req, res, next) => {
    const authToken = req.cookies.authToken;

    if (!authToken) return next();

    try {
        const getAuthToken = await db.query('SELECT * FROM authtoken WHERE Token = ?', [authToken]);
        if (getAuthToken.length === 0) return next();

        const user = await db.query('SELECT * FROM user WHERE Id = ?', [getAuthToken[0].UserId]);
        if (user.length === 0) return next();

        req.user = user[0];
        res.locals.user = req.user;

        if (req.user.Role === 'Admin') return res.redirect('/admin');
        next();
    } catch (e) {
        console.error(e);
        res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
    }
};

module.exports = authenticateToken;
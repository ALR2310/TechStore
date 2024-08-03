const express = require("express");
const router = express.Router();
const db = require('../configs/dbConnect');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password)
        return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ thông tin' });

    try {
        const [checkUsername, checkEmail] = await db.queryAll([
            { sql: 'SELECT * FROM user WHERE username = ?', params: [username] },
            { sql: 'SELECT * FROM user WHERE email = ?', params: [email] }
        ]);

        const errMsg = checkUsername.length > 0 ? 'Tài khoản đã tồn tại' : checkEmail.length > 0 ? 'Email đã tồn tại' : null;
        if (errMsg) return res.status(409).json({ success: false, message: errMsg });

        const hashPwd = await bcrypt.hash(password, 10);
        await db.query('INSERT INTO user (username, email, password) VALUES (?, ?, ?)', [username, email, hashPwd]);
        return res.status(201).json({ success: true, message: 'Đăng ký thành công' });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
    }
});

router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password)
        return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ thông tin' });

    try {
        const getUser = await db.query('SELECT * FROM user WHERE username = ? OR email = ?', [username, username]);

        if (getUser.length === 0)
            return res.status(401).json({ success: false, message: 'Tài khoản không tồn tại' });

        const checkPwd = await bcrypt.compare(password, getUser[0].Password);

        if (!checkPwd)
            return res.status(401).json({ success: false, message: 'Mật khẩu không chính xác' });

        let authToken;
        const checkAuthToken = await db.query('SELECT * FROM authtoken WHERE UserId = ?', [getUser[0].Id]);

        if (checkAuthToken.length > 0) {
            authToken = checkAuthToken[0].Token;
        } else {
            authToken = crypto.randomBytes(32).toString('hex');
            await db.query('INSERT INTO authtoken (UserId, Token) VALUES (?, ?)', [getUser[0].Id, authToken]);
        }

        return res.cookie('authToken', authToken, {
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true,
            secure: false
        }).status(200).json({ success: true, message: 'Đăng nhập thành công' });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
    }
});

router.get('/check', (req, res) => {
    const authToken = req.cookies.authToken;
    console.log(authToken);
    res.redirect('/');
});

module.exports = router;
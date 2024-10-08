const express = require("express");
const router = express.Router();
const db = require('../configs/dbConnect');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const passport = require("passport");

router.get('/', (req, res) => {
    if (req.user) return res.redirect("/");
    else return res.render('home/login');
});

router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password)
        return res.status(400).json({ success: false, message: 'Vui lòng nhập đầy đủ thông tin' });

    try {
        const [checkUsername, checkEmail] = await db.queryAll([
            { sql: 'SELECT * FROM user WHERE username = ?', params: [username] },
            { sql: 'SELECT * FROM user WHERE email = ?', params: [email] }
        ]);

        const errMsg = checkUsername.length > 0 ? 'Tài khoản đã tồn tại' : checkEmail.length > 0 ? 'Email đã tồn tại' : null;
        if (errMsg) return res.status(409).json({ success: false, message: errMsg });

        const hashPwd = await bcrypt.hash(password, 10);
        const result = await db.query('INSERT INTO user (username, email, password) VALUES (?, ?, ?)', [username, email, hashPwd]);
        await db.query('INSERT INTO UserInfo (UserId, FullName) VALUES (?, ?)', [result.insertId, username]);
        return res.status(201).json({ success: true, message: 'Đăng ký thành công' });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ success: false, message: 'Lỗi máy chủ', data: e });
    }
});

router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password)
        return res.status(400).json({ success: false, message: 'Vui lòng nhập đầy đủ thông tin' });

    try {
        const User = await db.query('SELECT * FROM User WHERE Username = ? OR Email = ? AND Status = ?',
            [username, username, "Active"]);

        if (User.length === 0) return res.status(401).json({ success: false, message: 'Tài khoản không tồn tại' });

        const checkPwd = await bcrypt.compare(password, User[0].Password);

        if (!checkPwd) return res.status(401).json({ success: false, message: 'Mật khẩu không chính xác' });

        let authToken = (await db.query('SELECT Token FROM authtoken WHERE UserId = ?', [User[0].Id]))[0]?.Token;
        if (!authToken) {
            authToken = crypto.randomBytes(32).toString('hex');
            await db.query('INSERT INTO authtoken (UserId, Token) VALUES (?, ?)', [User[0].Id, authToken]);
        }

        return res.cookie('authToken', authToken, {
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true,
            secure: false
        }).status(200).json({ success: true, message: 'Đăng nhập thành công' });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ success: false, message: 'Lỗi máy chủ', data: e });
    }
});

router.get('/loginGoogle', passport.authenticate('google'));
router.get('/loginGoogle/callback', passport.authenticate('google', { failureRedirect: '/' }), async (req, res) => {
    const GGId = req.user.id;
    const fullName = req.user.displayName;
    const Email = req.user.emails[0].value;

    try {
        const checkEmail = await db.query('SELECT * FROM User WHERE email = ? AND Status = ?', [Email, "Active"]);;
        let userId = checkEmail[0]?.Id;

        if (checkEmail.length > 0) {
            const checkGoogleId = await db.query('SELECT * FROM User WHERE GoogleId = ? AND Email = ? AND Status = ?',
                [GGId, Email, "Active"]);

            if (checkGoogleId.length == 0) {
                await db.query('UPDATE User SET GoogleId = ? WHERE Email = ? AND Status = ?', [GGId, Email, "Active"]);
                await db.query('UPDATE UserInfo SET FullName = ? WHERE UserId = ?', [fullName, userId]);
            }
        } else {
            userId = (await db.query('INSERT INTO User (GoogleId, Email) VALUES (?, ?)', [GGId, Email])).insertId;
            await db.query('INSERT INTO UserInfo (UserId, FullName) VALUES (?, ?)', [userId, fullName]);
        }

        let authToken = (await db.query('SELECT Token FROM authtoken WHERE UserId = ?', [User[0].Id]))[0]?.Token;
        if (!authToken) {
            authToken = crypto.randomBytes(32).toString('hex');
            await db.query('INSERT INTO authtoken (UserId, Token) VALUES (?, ?)', [User[0].Id, authToken]);
        }

        return res.cookie('authToken', authToken, {
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true,
            secure: false
        }).status(200).send(`
             <script>
                window.opener.postMessage({ success: true, message: 'Đăng nhập thành công' }, '*');
                window.close();
            </script>
        `);
    } catch (e) {
        console.error(e);
        return res.status(500).json({ success: false, message: 'Lỗi máy chủ', data: e });
    }
});

router.get('/loginFacebook', passport.authenticate('facebook'));
router.get('/loginFacebook/callback', passport.authenticate('facebook', { failureRedirect: '/' }), async (req, res) => {
    const FBId = req.user.id;
    const fullName = req.user.displayName;
    const Gender = req.user.gender;

    try {
        const checkFacebookId = await db.query('SELECT * FROM User WHERE FacebookId = ? AND Status = ?', [FBId, "Active"]);
        let userId = checkFacebookId[0]?.Id;

        userId = (await db.query('INSERT INTO User (FacebookId) VALUES (?)', [FBId])).insertId;
        await db.query('INSERT INTO UserInfo (UserId, FullName, Gender) VALUES (?, ?, ?)', [userId, fullName, Gender]);

        let authToken = (await db.query('SELECT Token FROM authtoken WHERE UserId = ?', [User[0].Id]))[0]?.Token;
        if (!authToken) {
            authToken = crypto.randomBytes(32).toString('hex');
            await db.query('INSERT INTO authtoken (UserId, Token) VALUES (?, ?)', [User[0].Id, authToken]);
        }

        return res.cookie('authToken', authToken, {
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true,
            secure: false
        }).status(200).send(`
             <script>
                window.opener.postMessage({ success: true, message: 'Đăng nhập thành công' }, '*');
                window.close();
            </script>
        `);
    } catch (e) {
        console.error(e);
        return res.status(500).json({ success: false, message: 'Lỗi máy chủ', data: e });
    }
});

router.get('/logout', (req, res) => {
    console.log('đã đăng xuất');

    try {
        const returnUrl = req.headers.referer || '/';

        return res.clearCookie('authToken', {
            httpOnly: true,
            secure: false
        }).status(200).redirect(returnUrl);
    } catch (e) {
        console.error(e);
        return res.status(500).json({ success: false, message: 'Lỗi máy chủ', data: e });
    }
});

module.exports = router;
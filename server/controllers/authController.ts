import bcrypt from 'bcryptjs';
import { db } from '../configs/dbConnect';
import crypto from 'crypto';

class AuthController {
  loginPage(req: any, res: any) {
    if (req.user) return res.redirect('/');
    else return res.render('home/login');
  }

  async register(req: any, res: any) {
    const { username, email, password } = req.body;

    if (!username || !email || !password)
      return res.status(400).json({ success: false, message: 'Vui lòng nhập đầy đủ thông tin' });

    try {
      const [checkUsername, checkEmail] = await db.queryAll([
        { sql: 'SELECT * FROM user WHERE username = ?', params: [username] },
        { sql: 'SELECT * FROM user WHERE email = ?', params: [email] },
      ]);

      const errMsg =
        checkUsername.length > 0 ? 'Tài khoản đã tồn tại' : checkEmail.length > 0 ? 'Email đã tồn tại' : null;
      if (errMsg) return res.status(409).json({ success: false, message: errMsg });

      const hashPwd = await bcrypt.hash(password, 10);
      const result = (await db.query('INSERT INTO user (username, email, password) VALUES (?, ?, ?)', [
        username,
        email,
        hashPwd,
      ])) as any;
      await db.query('INSERT INTO UserInfo (UserId, FullName) VALUES (?, ?)', [result.insertId, username]);
      return res.status(201).json({ success: true, message: 'Đăng ký thành công' });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ success: false, message: 'Lỗi máy chủ', data: e });
    }
  }

  async login(req: any, res: any) {
    const { username, password } = req.body;

    if (!username || !password)
      return res.status(400).json({ success: false, message: 'Vui lòng nhập đầy đủ thông tin' });

    try {
      const User = (await db.query('SELECT * FROM User WHERE UserName = ? OR Email = ? AND Status = ?', [
        username,
        username,
        'Active',
      ])) as any[];

      if (User.length === 0) return res.status(401).json({ success: false, message: 'Tài khoản không tồn tại' });

      const checkPwd = await bcrypt.compare(password, User[0].Password);

      if (!checkPwd) return res.status(401).json({ success: false, message: 'Mật khẩu không chính xác' });

      let authToken = (await db.query('SELECT Token FROM authtoken WHERE UserId = ?', [User[0].Id]))[0]?.Token;
      if (!authToken) {
        authToken = crypto.randomBytes(32).toString('hex');
        await db.query('INSERT INTO authtoken (UserId, Token) VALUES (?, ?)', [User[0].Id, authToken]);
      }

      // Lấy chi tiết người dùng
      const userInfo = await db.query('SELECT * FROM UserInfo WHERE UserId = ?', [User[0].Id]);
      if (userInfo.length > 0) {
        User[0].FullName = userInfo[0].FullName;
      }

      return res
        .cookie('authToken', authToken, {
          maxAge: 7 * 24 * 60 * 60 * 1000,
          httpOnly: true,
          secure: false,
        })
        .status(200)
        .json({
          success: true,
          message: 'Đăng nhập thành công',
          data: { userId: User[0].Id, username: User[0].UserName, email: User[0].Email, fullName: User[0].FullName },
        });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ success: false, message: 'Lỗi máy chủ', data: e });
    }
  }

  async loginGoogleCallback(req: any, res: any) {
    const GGId = req.user.id;
    const fullName = req.user.displayName;
    const Email = req.user.emails[0].value;

    try {
      const checkEmail: any = await db.query('SELECT * FROM User WHERE email = ? AND Status = ?', [Email, 'Active']);
      let userId = checkEmail[0]?.Id;

      if (checkEmail.length > 0) {
        const checkGoogleId: any = await db.query(
          'SELECT * FROM User WHERE GoogleId = ? AND Email = ? AND Status = ?',
          [GGId, Email, 'Active'],
        );

        if (checkGoogleId.length == 0) {
          await db.query('UPDATE User SET GoogleId = ? WHERE Email = ? AND Status = ?', [GGId, Email, 'Active']);
          await db.query('UPDATE UserInfo SET FullName = ? WHERE UserId = ?', [fullName, userId]);
        }
      } else {
        userId = ((await db.query('INSERT INTO User (GoogleId, Email) VALUES (?, ?)', [GGId, Email])) as any).insertId;
        await db.query('INSERT INTO UserInfo (UserId, FullName) VALUES (?, ?)', [userId, fullName]);
      }

      let authToken = (await db.query('SELECT Token FROM authtoken WHERE UserId = ?', [userId]))[0]?.Token;
      if (!authToken) {
        authToken = crypto.randomBytes(32).toString('hex');
        await db.query('INSERT INTO authtoken (UserId, Token) VALUES (?, ?)', [userId, authToken]);
      }

      return res
        .cookie('authToken', authToken, {
          maxAge: 7 * 24 * 60 * 60 * 1000,
          httpOnly: true,
          secure: false,
        })
        .status(200).send(`
                 <script>
                    window.opener.postMessage({ success: true, message: 'Đăng nhập thành công' }, '*');
                    window.close();
                </script>
            `);
    } catch (e) {
      console.error(e);
      return res.status(500).json({ success: false, message: 'Lỗi máy chủ', data: e });
    }
  }

  async loginFacebookCallback(req: any, res: any) {
    const FBId = req.user.id;
    const fullName = req.user.displayName;
    const Gender = req.user.gender;

    try {
      const checkFacebookId = await db.query('SELECT * FROM User WHERE FacebookId = ? AND Status = ?', [
        FBId,
        'Active',
      ]);
      let userId = checkFacebookId[0]?.Id;

      userId = ((await db.query('INSERT INTO User (FacebookId) VALUES (?)', [FBId])) as any).insertId;
      await db.query('INSERT INTO UserInfo (UserId, FullName, Gender) VALUES (?, ?, ?)', [userId, fullName, Gender]);

      let authToken = (await db.query('SELECT Token FROM authtoken WHERE UserId = ?', [userId]))[0]?.Token;
      if (!authToken) {
        authToken = crypto.randomBytes(32).toString('hex');
        await db.query('INSERT INTO authtoken (UserId, Token) VALUES (?, ?)', [userId, authToken]);
      }

      return res
        .cookie('authToken', authToken, {
          maxAge: 7 * 24 * 60 * 60 * 1000,
          httpOnly: true,
          secure: false,
        })
        .status(200).send(`
             <script>
                window.opener.postMessage({ success: true, message: 'Đăng nhập thành công' }, '*');
                window.close();
            </script>
        `);
    } catch (e) {
      console.error(e);
      return res.status(500).json({ success: false, message: 'Lỗi máy chủ', data: e });
    }
  }

  logout(req: any, res: any) {
    console.log('đã đăng xuất');

    try {
      const returnUrl = req.headers.referer || '/';

      return res
        .clearCookie('authToken', {
          httpOnly: true,
          secure: false,
        })
        .status(200)
        .redirect(returnUrl);
    } catch (e) {
      console.error(e);
      return res.status(500).json({ success: false, message: 'Lỗi máy chủ', data: e });
    }
  }
}

export const authController = new AuthController();

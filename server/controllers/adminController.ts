import path from 'path';
import { db } from '../configs/dbConnect';
import fs from 'fs';
import fetchHTML from '../utils/scraper';
import myUtils from '../utils/myUtils';

class AdminController {
  async indexPage(_req: any, res: any) {
    const [userStats, orderStats, productStats, revenueStats] = await db.queryAll([
      {
        sql: `SELECT 
                        COUNT(*) AS total,
                        SUM(CASE WHEN Status = ? THEN 1 ELSE 0 END) AS active,
                        SUM(CASE WHEN Status = ? THEN 1 ELSE 0 END) AS inactive
                      FROM User;`,
        params: ['Active', 'Inactive'],
      },
      {
        sql: `SELECT 
                        COUNT(*) AS total,
                        SUM(CASE WHEN Status = ? THEN 1 ELSE 0 END) AS processing,
                        SUM(CASE WHEN Status = ? THEN 1 ELSE 0 END) AS delivering
                      FROM Orders;`,
        params: ['Processing', 'Delivering'],
      },
      {
        sql: `SELECT 
                        COUNT(*) AS total,
                        SUM(CASE WHEN Quantity = ? AND Status = ? THEN 1 ELSE 0 END) AS outOfStock,
                        SUM(CASE WHEN Quantity > 0 AND Quantity < ? AND Status = ? THEN 1 ELSE 0 END) AS lowStock
                      FROM Product;`,
        params: [0, 'Active', 10, 'Active'],
      },
      {
        sql: `SELECT 
                        SUM(CASE WHEN DATE(createdAt) = DATE(?) THEN TotalPrice ELSE 0 END) AS today,
                        SUM(CASE WHEN createdAt >= DATE(?, '-7 days') THEN TotalPrice ELSE 0 END) AS thisWeek,
                        SUM(CASE WHEN createdAt >= DATE(?, 'start of month') THEN TotalPrice ELSE 0 END) AS thisMonth
                    FROM Orders;`,
        params: ['now', 'now', 'now'],
      },
    ]);

    const [revenueByDay, revenueByWeek, revenueByMonth] = await db.queryAll([
      {
        sql: `SELECT 
                      DATE(createdAt) AS OrderDate,
                      SUM(TotalPrice) AS DailyRevenue
                    FROM Orders
                    GROUP BY DATE(createdAt)
                    ORDER BY OrderDate;`,
      },
      {
        sql: `SELECT 
                      STRFTIME('%Y-%W', createdAt) AS OrderWeek,
                      SUM(TotalPrice) AS WeeklyRevenue
                    FROM Orders
                    GROUP BY STRFTIME('%Y-%W', createdAt)
                    ORDER BY OrderWeek;`,
      },
      {
        sql: `SELECT 
                      STRFTIME('%Y-%m', createdAt) AS OrderMonth,
                      SUM(TotalPrice) AS MonthlyRevenue
                    FROM Orders
                    GROUP BY STRFTIME('%Y-%m', createdAt)
                    ORDER BY OrderMonth;`,
      },
    ]);

    const [usersByDay, usersByWeek, usersByMonth] = await db.queryAll([
      {
        sql: `SELECT 
                      DATE(createdAt) AS RegDate,
                      COUNT(*) AS DailyUsers
                    FROM User
                    GROUP BY DATE(createdAt)
                    ORDER BY RegDate;`,
      },
      {
        sql: `SELECT 
                      STRFTIME('%Y-%W', createdAt) AS RegWeek,
                      COUNT(*) AS WeeklyUsers
                    FROM User
                    GROUP BY STRFTIME('%Y-%W', createdAt)
                    ORDER BY RegWeek;`,
      },
      {
        sql: `SELECT 
                      STRFTIME('%Y-%m', createdAt) AS RegMonth,
                      COUNT(*) AS MonthlyUsers
                    FROM User
                    GROUP BY STRFTIME('%Y-%m', createdAt)
                    ORDER BY RegMonth;`,
      },
    ]);

    const [productViewed, productSelling] = await db.queryAll([
      {
        sql: `SELECT 
                        p.ProdName, p.Image, p.Slugs,
                        COUNT(pv.Id) AS ViewCount,
                        AVG(pr.Rating) AS AvgRating
                    FROM Product p
                    LEFT JOIN ProductViewed pv ON p.Id = pv.ProdId
                    LEFT JOIN ProductReviews pr ON p.Id = pr.ProdId
                    WHERE p.Status = 'Active'
                    GROUP BY p.Id, p.ProdName
                    ORDER BY ViewCount DESC, AvgRating DESC
                    LIMIT 20;`,
      },
      {
        sql: `SELECT 
                        p.ProdName, p.Image, p.Slugs,
                        SUM(oi.Quantity) AS TotalSold
                    FROM Product p
                    JOIN OrderItems oi ON p.Id = oi.ProdId
                    WHERE p.Status = 'Active'
                    GROUP BY p.Id, p.ProdName
                    ORDER BY TotalSold DESC
                    LIMIT 20;`,
      },
    ]);

    const data = {
      userStats: userStats[0],
      orderStats: orderStats[0],
      productStats: productStats[0],
      revenueStats: revenueStats[0],
      revenueByDay,
      revenueByWeek,
      revenueByMonth,
      usersByDay,
      usersByWeek,
      usersByMonth,
      productViewed,
      productSelling,
    };

    res.render('admin/index', { layout: 'admin', ...data });
  }

  async productPage(req: any, res: any) {
    const { q } = req.query;

    const sql = `SELECT 
    P.Id, P.Image, P.ProdName, P.Quantity, P.Price, P.Discount, P.Slugs,
    C.CateName, C.Slugs AS CateSlugs, C.Id AS CateId,
    B.Id AS BrandId, B.BrandName,
    BS.Id AS BrandSeriesId, BS.SeriesName
  FROM Product AS P
    JOIN Categories AS C ON P.CateId = C.Id
    JOIN Brands AS B ON P.BrandId = B.Id
    JOIN BrandSeries AS BS ON P.BrandSeriesId = BS.Id
  WHERE P.Status = ? ${q ? 'AND P.ProdName LIKE ?' : ''}`;

    const params = q ? ['Active', `%${q}%`] : ['Active'];
    const products = await db.query(sql, params);

    res.render('admin/product/index', { layout: 'admin', products });
  }

  async productDelete(req: any, res: any) {
    const { id } = req.body;

    try {
      await db.query(`UPDATE Product SET Status = 'Inactive' WHERE Id = ?`, [id]);
      return res.status(200).json({ success: true, message: 'Xoá thành công' });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ success: false, message: 'Lỗi máy chủ', data: e });
    }
  }

  async productCreatePage(_req: any, res: any) {
    try {
      const [categories, brands, brandSeries, tags] = await db.queryAll([
        { sql: 'SELECT * FROM Categories' },
        { sql: 'SELECT * FROM Brands' },
        { sql: 'SELECT * FROM BrandSeries' },
        { sql: 'SELECT * FROM Tags' },
      ]);

      const uniqueTags = Array.from(new Set(tags.map((tag) => tag.TagName.toLowerCase()))).map((tagName) => {
        return tags.find((tag) => tag.TagName.toLowerCase() === tagName);
      });
      return res.status(200).render('admin/product/create', {
        layout: 'admin',
        categories,
        brands,
        brandSeries,
        tags: uniqueTags,
      });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ success: false, message: 'Lỗi máy chủ', data: e });
    }
  }

  async productCreate(req: any, res: any) {
    const {
      Id,
      CateId,
      BrandId,
      BrandSeriesId,
      ProdName,
      Quantity,
      Price,
      Discount,
      Slugs,
      createdAt,
      DeviceCfg,
      Content,
      Tags,
    } = req.body;

    if (!CateId || !ProdName || !Quantity || !Price || !Discount || !Slugs || !createdAt) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập đầy đủ thông tin' });
    }

    const absoImagePath = req.file ? req.file.path : null;
    let relaImagePath = absoImagePath ? path.relative(path.join(__dirname, '..', 'assets'), absoImagePath) : null;

    if (absoImagePath && Slugs) {
      const extname = path.extname(req.file.originalname);
      const newFileName = `${Slugs}${extname}`;
      const newFilePath = path.join(path.dirname(absoImagePath), newFileName);

      fs.renameSync(absoImagePath, newFilePath);
      relaImagePath = path.relative(path.join(__dirname, '..', 'assets'), newFilePath);
    }

    try {
      if (!Id) {
        let sql = `INSERT INTO Product(CateId, BrandId${
          BrandSeriesId && BrandSeriesId !== '0' ? ', BrandSeriesId' : ''
        }, Image, ProdName, Quantity, Price, Discount, Slugs, createdAt) 
                 VALUES(?, ?, ${BrandSeriesId && BrandSeriesId !== '0' ? '?, ' : ''}?, ?, ?, ?, ?, ?, ?)`;

        let params = [CateId, BrandId];
        if (BrandSeriesId && BrandSeriesId !== '0') params.push(BrandSeriesId);
        params.push(relaImagePath, ProdName, Quantity, Price, Discount, Slugs, createdAt);

        const result = (await db.query(sql, params)) as any;

        await db.query('INSERT INTO ProductDetails(ProdId, DeviceCfg, Content, createdAt) VALUES(?, ?, ?, ?)', [
          result.insertId,
          DeviceCfg,
          Content,
          createdAt,
        ]);

        if (Tags) {
          const tagsArray = Tags.split(',').map((tag) => tag.trim());
          const tagQueries = tagsArray.map((tagName) => ({
            sql: 'INSERT INTO Tags(ProdId, TagName) VALUES(?, ?)',
            params: [result.insertId, tagName],
          }));
          await db.queryAll(tagQueries);
        }

        return res.status(200).json({ success: true, message: 'Thêm sản phẩm thành công' });
      } else {
        let sql = `UPDATE Product SET 
                 CateId = ?, 
                 BrandId = ?,
                 ${BrandSeriesId && BrandSeriesId !== '0' ? 'BrandSeriesId = ?, ' : 'BrandSeriesId = NULL, '}
                 ${relaImagePath ? 'Image = ?, ' : ''}
                 ProdName = ?, 
                 Quantity = ?, 
                 Price = ?, 
                 Discount = ?, 
                 Slugs = ?, 
                 AtUpdate = ?
                 WHERE Id = ?`;

        let params = [CateId, BrandId];
        if (BrandSeriesId && BrandSeriesId !== '0') params.push(BrandSeriesId);
        if (relaImagePath) params.push(relaImagePath);
        params.push(ProdName, Quantity, Price, Discount, Slugs, createdAt, Id);

        await db.query(sql, params);

        await db.query('UPDATE ProductDetails SET DeviceCfg = ?, Content = ?, AtUpdate = ? WHERE ProdId = ?', [
          DeviceCfg,
          Content,
          createdAt,
          Id,
        ]);

        if (Tags) {
          await db.query('DELETE FROM Tags WHERE ProdId = ?', [Id]);
          const tagsArray = Tags.split(',').map((tag) => tag.trim());
          const tagQueries = tagsArray.map((tagName) => ({
            sql: 'INSERT INTO Tags(ProdId, TagName) VALUES(?, ?)',
            params: [Id, tagName],
          }));
          await db.queryAll(tagQueries);
        }

        return res.status(200).json({ success: true, message: 'Cập nhật sản phẩm thành công' });
      }
    } catch (e) {
      console.error(e);
      return res.status(500).json({ success: false, message: 'Lỗi máy chủ', data: e });
    }
  }

  async productUpdatePage(req: any, res: any) {
    const { id } = req.params;

    try {
      const productSql = `SELECT * FROM Product AS P 
                      JOIN ProductDetails AS PD ON P.Id = PD.ProdId 
                    WHERE P.Id = ?`;
      const [product, categories, brands, brandSeries, tags] = await db.queryAll([
        { sql: productSql, params: [id] },
        { sql: 'SELECT * FROM Categories' },
        { sql: 'SELECT * FROM Brands' },
        { sql: 'SELECT * FROM BrandSeries' },
        { sql: 'SELECT * FROM Tags' },
      ]);

      const uniqueTags = Array.from(new Set(tags.map((tag) => tag.TagName.toLowerCase()))).map((tagName) => {
        return tags.find((tag) => tag.TagName.toLowerCase() === tagName);
      });

      return res.status(200).render('admin/product/create', {
        layout: 'admin',
        product: product[0],
        categories,
        brands,
        brandSeries,
        tags: uniqueTags,
      });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ success: false, message: 'Lỗi máy chủ', data: e });
    }
  }

  async productImportFromURL(req: any, res: any) {
    const { url } = req.body;

    if (!url) return res.status(400).json({ success: false, message: 'Vui lòng nhập đầy đủ thông tin' });

    try {
      const product = await fetchHTML(url);
      return res.status(200).json({
        success: true,
        message: 'Lấy thông tin sản phẩm thành công',
        data: product,
      });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ success: false, message: 'Lỗi máy chủ', data: e });
    }
  }

  async productCheckName(req: any, res: any) {
    const { ProdName } = req.body;

    try {
      const result = (await db.query('SELECT ProdName FROM Product WHERE ProdName = ?', [ProdName])) as any[];

      if (result.length > 0) return res.status(409).json({ success: false, message: 'Tên sản phẩm đã tồn tại' });
      return res.status(200).json({ success: true, message: 'Tên sản phẩm hợp lệ' });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ success: false, message: 'Lỗi máy chủ', data: e });
    }
  }

  async categoryCreate(req: any, res: any) {
    const { CateName } = req.body;

    if (!CateName) return res.status(400).json({ success: false, message: 'Vui lòng nhập đầy đủ thông tin' });

    try {
      const cateSlugs = myUtils.formatToSlugs(CateName);

      const result = await db.query('INSERT INTO Categories (CateName, Slugs) VALUES (?, ?)', [CateName, cateSlugs]);
      return res.status(200).json({
        success: true,
        message: 'Thêm danh mục thành công',
        data: result,
      });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ success: false, message: 'Lỗi máy chủ', data: e });
    }
  }

  async brandCreate(req: any, res: any) {
    const { BrandName } = req.body;

    if (!BrandName) return res.status(400).json({ success: false, message: 'Vui lòng nhập đầy đủ thông tin' });

    try {
      const result = await db.query('INSERT INTO Brands (BrandName) VALUES (?)', [BrandName]);
      return res.status(200).json({
        success: true,
        message: 'Thêm thương hiệu thành công',
        data: result,
      });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ success: false, message: 'Lỗi máy chủ', data: e });
    }
  }

  async brandSeriesCreate(req: any, res: any) {
    const { BrandId, SeriesName } = req.body;

    if (!BrandId || !SeriesName)
      return res.status(400).json({ success: false, message: 'Vui lòng nhập đầy đủ thông tin' });

    try {
      const result = await db.query('INSERT INTO BrandSeries (BrandId, SeriesName) VALUES (?, ?)', [
        BrandId,
        SeriesName,
      ]);
      return res.status(200).json({
        success: true,
        message: 'Thêm dòng thương hiệu thành công',
        data: result,
      });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ success: false, message: 'Lỗi máy chủ', data: e });
    }
  }

  async userPage(_req: any, res: any) {
    const users = await db.query('SELECT * FROM User JOIN UserInfo ON User.Id = UserInfo.UserId');

    res.render('admin/user/index', { layout: 'admin', users });
  }

  async userUpdate(req: any, res: any) {
    const { id, fullName, phoneNumber, email, gender, dateOfBirth, role, status } = req.body;

    if (!id) {
      return res.status(400).json({ success: false, message: 'Thiếu ID người dùng' });
    }

    const userUpdateFields: any[] = [];
    const userParams: any[] = [];
    if (email !== undefined) {
      userUpdateFields.push('Email = ?');
      userParams.push(email);
    }
    if (role !== undefined) {
      userUpdateFields.push('Role = ?');
      userParams.push(role);
    }
    if (status !== undefined) {
      userUpdateFields.push('Status = ?');
      userParams.push(status);
    }

    const userInfoUpdateFields: any[] = [];
    const userInfoParams: any[] = [];
    if (fullName !== undefined) {
      userInfoUpdateFields.push('FullName = ?');
      userInfoParams.push(fullName);
    }
    if (phoneNumber !== undefined) {
      userInfoUpdateFields.push('PhoneNumber = ?');
      userInfoParams.push(phoneNumber);
    }
    if (gender !== undefined) {
      userInfoUpdateFields.push('Gender = ?');
      userInfoParams.push(gender);
    }
    if (dateOfBirth !== undefined) {
      userInfoUpdateFields.push('DoB = ?');
      userInfoParams.push(dateOfBirth);
    }

    if (userUpdateFields.length === 0 && userInfoUpdateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cập nhật ít nhất một trường',
      });
    }

    try {
      if (userUpdateFields.length > 0) {
        const userQuery = `UPDATE User SET ${userUpdateFields.join(', ')} WHERE id = ?`;
        userParams.push(id);
        const userResult = (await db.query(userQuery, userParams)) as any;
        if (userResult.changes === 0) {
          return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
        }
      }

      if (userInfoUpdateFields.length > 0) {
        const userInfoQuery = `UPDATE UserInfo SET ${userInfoUpdateFields.join(', ')} WHERE UserId = ?`;
        userInfoParams.push(id);
        await db.query(userInfoQuery, userInfoParams);
      }

      return res.status(200).json({ success: true, message: 'Cập nhật người dùng thành công' });
    } catch (error: any) {
      console.error('Lỗi khi cập nhật người dùng:', error);
      return res.status(500).json({ success: false, message: 'Lỗi máy chủ', error: error.message });
    }
  }

  async userDelete(req: any, res: any) {
    const { id } = req.body;

    if (!id) return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ thông tin' });

    try {
      await db.query('DELETE FROM User WHERE Id = ?', [id]);
      await db.query('DELETE FROM UserInfo WHERE UserId = ?', [id]);
      return res.status(200).json({ success: true, message: 'Xóa người dùng thành công' });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ success: false, message: 'Lỗi máy chủ', data: e });
    }
  }

  async orderPage(_req: any, res: any) {
    try {
      const sql = `
          SELECT 
            O.Id, O.TotalPrice, O.createdAt, O.Status, O.Code,
            OI.Quantity,
            P.Image, P.ProdName, P.Slugs,
            A.FullName, A.PhoneNumber, A.AddressLine
          FROM Orders as O 
            JOIN OrderItems as OI ON O.Id = OI.OrdId 
            JOIN Product as P ON OI.ProdId = P.Id
            JOIN Address as A ON O.AdrId = A.Id
          ORDER BY O.createdAt DESC
        `;
      const orders = await db.query(sql);

      res.render('admin/order/index', { layout: 'admin', orders });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ success: false, message: 'Lỗi máy chủ', data: err });
    }
  }

  async orderStatusUpdate(req: any, res: any) {
    try {
      const { id, status } = req.body;

      if (!id || !status) return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ thông tin' });

      await db.query('UPDATE Orders SET Status = ? WHERE Id = ?', [status, id]);
      return res.status(200).json({
        success: true,
        message: 'Cập nhật trạng thái đơn hàng thành công',
      });
    } catch (e) {
      console.log(e);
      return res.status(500).json({ success: false, message: 'Lỗi máy chủ', data: e });
    }
  }
}

export const adminController = new AdminController();

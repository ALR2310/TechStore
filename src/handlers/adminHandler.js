const express = require("express");
const router = express.Router();
const db = require("../configs/dbConnect");
const upload = require("../middleware/upload");
const path = require("path");
const fs = require("fs");
const scraper = require("../utils/scraper");
const myUtils = require("../utils/myUtils");

router.get("/", (req, res) => {
  res.render("admin/index", { layout: "admin" });
});

router.get("/product/create", async (req, res) => {
  try {
    const [categories, brands, brandSeries, tags] = await db.queryAll([
      { sql: "SELECT * FROM Categories" },
      { sql: "SELECT * FROM Brands" },
      { sql: "SELECT * FROM BrandSeries" },
      { sql: "SELECT * FROM Tags" },
    ]);

    const uniqueTags = Array.from(
      new Set(tags.map((tag) => tag.TagName.toLowerCase()))
    ).map((tagName) => {
      return tags.find((tag) => tag.TagName.toLowerCase() === tagName);
    });
    return res.status(200).render("admin/product/create", {
      layout: "admin",
      categories,
      brands,
      brandSeries,
      tags: uniqueTags,
    });
  } catch (e) {
    console.error(e);
    return res
      .status(500)
      .json({ success: false, message: "Lỗi máy chủ", data: e });
  }
});

router.post("/product/create", upload.single("Image"), async (req, res) => {
  const {
    CateId,
    BrandId,
    BrandSeriesId,
    ProdName,
    Quantity,
    Price,
    Discount,
    Slugs,
    AtCreate,
    DeviceCfg,
    Content,
    Tags,
  } = req.body;

  if (
    !CateId ||
    !ProdName ||
    !Quantity ||
    !Price ||
    !Discount ||
    !Slugs ||
    !AtCreate
  )
    return res
      .status(400)
      .json({ success: false, message: "Vui lòng nhập đầy đủ thông tin" });

  const absoImagePath = req.file ? req.file.path : null;
  let relaImagePath = path.relative(
    path.join(__dirname, "..", "assets"),
    absoImagePath
  );

  if (absoImagePath && Slugs) {
    const extname = path.extname(req.file.originalname);
    const newFileName = `${Slugs}${extname}`;
    const newFilePath = path.join(path.dirname(absoImagePath), newFileName);

    fs.renameSync(absoImagePath, newFilePath);
    relaImagePath = path.relative(
      path.join(__dirname, "..", "assets"),
      newFilePath
    );
  }

  try {
    let sql = `INSERT INTO Product(CateId, BrandId${
      BrandSeriesId && BrandSeriesId !== "0" ? ", BrandSeriesId" : ""
    }, Image, 
            ProdName, Quantity, Price, Discount, Slugs, AtCreate) VALUES(?, ?, ${
              BrandSeriesId && BrandSeriesId !== "0" ? "?, " : ""
            }?, ?, ?, ?, ?, ?, ?)`;

    let params = [CateId, BrandId];
    if (BrandSeriesId && BrandSeriesId !== "0") params.push(BrandSeriesId);
    params.push(
      relaImagePath,
      ProdName,
      Quantity,
      Price,
      Discount,
      Slugs,
      AtCreate
    );

    const result = await db.query(sql, params);

    params = [result.insertId, DeviceCfg, Content, AtCreate];
    await db.query(
      "INSERT INTO ProductDetails(ProdId, DeviceCfg, Content, AtCreate) VALUES(?, ?, ?, ?)",
      params
    );

    if (Tags) {
      const tagsArray = Tags.split(",").map((tag) => tag.trim());
      const tagQueries = tagsArray.map((tagName) => {
        return {
          sql: "INSERT INTO Tags(ProdId, TagName) VALUES(?, ?)",
          params: [result.insertId, tagName],
        };
      });
      await db.queryAll(tagQueries);
    }

    return res
      .status(200)
      .json({ success: true, message: "Thêm sản phẩm thành công" });
  } catch (e) {
    console.error(e);
    return res
      .status(500)
      .json({ success: false, message: "Lỗi máy chủ", data: e });
  }
});

router.post("/product/import-from-url", async (req, res) => {
  const { url } = req.body;

  if (!url)
    return res
      .status(400)
      .json({ success: false, message: "Vui lòng nhập đầy đủ thông tin" });

  try {
    const product = await scraper(url);
    return res.status(200).json({
      success: true,
      message: "Lấy thông tin sản phẩm thành công",
      data: product,
    });
  } catch (e) {
    console.error(e);
    return res
      .status(500)
      .json({ success: false, message: "Lỗi máy chủ", data: e });
  }
});

router.post("/product/check-product-name", async (req, res) => {
  const { ProdName } = req.body;

  try {
    const result = await db.query(
      "SELECT ProdName FROM Product WHERE ProdName = ?",
      [ProdName]
    );

    if (result.length > 0)
      return res
        .status(409)
        .json({ success: false, message: "Tên sản phẩm đã tồn tại" });
    return res
      .status(200)
      .json({ success: true, message: "Tên sản phẩm hợp lệ" });
  } catch (e) {
    console.error(e);
    return res
      .status(500)
      .json({ success: false, message: "Lỗi máy chủ", data: e });
  }
});

router.post("/categories/create", async (req, res) => {
  const { CateName } = req.body;

  if (!CateName)
    return res
      .status(400)
      .json({ success: false, message: "Vui lòng nhập đầy đủ thông tin" });

  try {
    const cateSlugs = myUtils.formatToSlugs(CateName);

    const result = await db.query(
      "INSERT INTO Categories (CateName, Slugs) VALUES (?, ?)",
      [CateName, cateSlugs]
    );
    return res.status(200).json({
      success: true,
      message: "Thêm danh mục thành công",
      data: result,
    });
  } catch (e) {
    console.error(e);
    return res
      .status(500)
      .json({ success: false, message: "Lỗi máy chủ", data: e });
  }
});

router.post("/brands/create", async (req, res) => {
  const { BrandName } = req.body;

  if (!BrandName)
    return res
      .status(400)
      .json({ success: false, message: "Vui lòng nhập đầy đủ thông tin" });

  try {
    const result = await db.query("INSERT INTO Brands (BrandName) VALUES (?)", [
      BrandName,
    ]);
    return res.status(200).json({
      success: true,
      message: "Thêm thương hiệu thành công",
      data: result,
    });
  } catch (e) {
    console.error(e);
    return res
      .status(500)
      .json({ success: false, message: "Lỗi máy chủ", data: e });
  }
});

router.post("/brand-series/create", async (req, res) => {
  const { BrandId, SeriesName } = req.body;

  if (!BrandId || !SeriesName)
    return res
      .status(400)
      .json({ success: false, message: "Vui lòng nhập đầy đủ thông tin" });

  try {
    const result = await db.query(
      "INSERT INTO BrandSeries (BrandId, SeriesName) VALUES (?, ?)",
      [BrandId, SeriesName]
    );
    return res.status(200).json({
      success: true,
      message: "Thêm dòng thương hiệu thành công",
      data: result,
    });
  } catch (e) {
    console.error(e);
    return res
      .status(500)
      .json({ success: false, message: "Lỗi máy chủ", data: e });
  }
});

router.get("/user", async (req, res) => {
  const users = await db.query(
    "SELECT * FROM User JOIN UserInfo ON User.Id = UserInfo.UserId"
  );

  res.render("admin/user/index", { layout: "admin", users });
});

router.patch("/user", async (req, res) => {
  const {
    id,
    fullName,
    phoneNumber,
    email,
    gender,
    dateOfBirth,
    role,
    status,
  } = req.body;

  if (!id) {
    return res
      .status(400)
      .json({ success: false, message: "Thiếu ID người dùng" });
  }

  const userUpdateFields = [];
  const userParams = [];
  if (email !== undefined) {
    userUpdateFields.push("Email = ?");
    userParams.push(email);
  }
  if (role !== undefined) {
    userUpdateFields.push("Role = ?");
    userParams.push(role);
  }
  if (status !== undefined) {
    userUpdateFields.push("Status = ?");
    userParams.push(status);
  }

  const userInfoUpdateFields = [];
  const userInfoParams = [];
  if (fullName !== undefined) {
    userInfoUpdateFields.push("FullName = ?");
    userInfoParams.push(fullName);
  }
  if (phoneNumber !== undefined) {
    userInfoUpdateFields.push("PhoneNumber = ?");
    userInfoParams.push(phoneNumber);
  }
  if (gender !== undefined) {
    userInfoUpdateFields.push("Gender = ?");
    userInfoParams.push(gender);
  }
  if (dateOfBirth !== undefined) {
    userInfoUpdateFields.push("DoB = ?");
    userInfoParams.push(dateOfBirth);
  }

  if (userUpdateFields.length === 0 && userInfoUpdateFields.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Vui lòng cập nhật ít nhất một trường",
    });
  }

  try {
    if (userUpdateFields.length > 0) {
      const userQuery = `UPDATE User SET ${userUpdateFields.join(
        ", "
      )} WHERE id = ?`;
      userParams.push(id);
      const userResult = await db.query(userQuery, userParams);
      if (userResult.changes === 0) {
        return res
          .status(404)
          .json({ success: false, message: "Không tìm thấy người dùng" });
      }
    }

    if (userInfoUpdateFields.length > 0) {
      const userInfoQuery = `UPDATE UserInfo SET ${userInfoUpdateFields.join(
        ", "
      )} WHERE UserId = ?`;
      userInfoParams.push(id);
      await db.query(userInfoQuery, userInfoParams);
    }

    return res
      .status(200)
      .json({ success: true, message: "Cập nhật người dùng thành công" });
  } catch (error) {
    console.error("Lỗi khi cập nhật người dùng:", error);
    return res
      .status(500)
      .json({ success: false, message: "Lỗi máy chủ", error: error.message });
  }
});

router.delete("/user", async (req, res) => {
  const { id } = req.body;

  if (!id)
    return res
      .status(400)
      .json({ success: false, message: "Vui lòng điền đầy đủ thông tin" });

  try {
    await db.query("DELETE FROM User WHERE Id = ?", [id]);
    await db.query("DELETE FROM UserInfo WHERE UserId = ?", [id]);
    return res
      .status(200)
      .json({ success: true, message: "Xóa người dùng thành công" });
  } catch (e) {
    console.error(e);
    return res
      .status(500)
      .json({ success: false, message: "Lỗi máy chủ", data: e });
  }
});

router.get("/order", async (req, res) => {
  try {
    const sql = `
      SELECT 
        O.Id, O.TotalPrice, O.AtCreate, O.Status, O.Code,
        OI.Quantity,
        P.Image, P.ProdName, P.Slugs,
        A.FullName, A.PhoneNumber, A.AddressLine
      FROM Orders as O 
        JOIN OrderItems as OI ON O.Id = OI.OrdId 
        JOIN Product as P ON OI.ProdId = P.Id
        JOIN Address as A ON O.AdrId = A.Id
    `;
    const orders = await db.query(sql);

    res.render("admin/order/index", { layout: "admin", orders });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ success: false, message: "Lỗi máy chủ", data: err });
  }
});

router.post("/order/status", async (req, res) => {
  try {
    const { id, status } = req.body;

    if (!id || !status)
      return res
        .status(400)
        .json({ success: false, message: "Vui lòng điền đầy đủ thông tin" });

    await db.query("UPDATE Orders SET Status = ? WHERE Id = ?", [status, id]);
    return res.status(200).json({
      success: true,
      message: "Cập nhật trạng thái đơn hàng thành công",
    });
  } catch (e) {
    console.log(e);
    return res
      .status(500)
      .json({ success: false, message: "Lỗi máy chủ", data: e });
  }
});

module.exports = router;

import { db } from '../configs/dbConnect';

class CartController {
  async index(req: any, res: any) {
    try {
      const sqlCart = `
                SELECT 
                    c.Id as CartId,
                    c.Quantity as CartQuantity,
                    p.*,
                    CAST(p.Price - (p.Price * (p.Discount / 100)) AS INTEGER) AS FinalPrice
                FROM Cart c
                JOIN Product p ON c.ProdId = p.Id
                WHERE c.UserId = ? AND c.Status = ?`;

      const sqlAddress = `SELECT * FROM Address WHERE UserId = ? AND Status = ? ORDER BY IsDefault DESC`;

      const [cart, address] = await db.queryAll([
        { sql: sqlCart, params: [req.user.Id, 'Active'] },
        { sql: sqlAddress, params: [req.user.Id, 'Active'] },
      ]);

      return res.render('home/cart', { cart, address });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ success: false, message: 'Lỗi máy chủ', data: e });
    }
  }

  async create(req: any, res: any) {
    const { productId } = req.body;

    if (!productId) return res.status(400).json({ success: false, message: 'Vui lòng nhập đủ thông tin' });

    try {
      let sql = `SELECT * FROM Cart WHERE ProdId = ? AND Status = ? AND UserId = ?`;
      const cartExists: any = await db.query(sql, [productId, 'Active', req.user.Id]);

      if (cartExists.length > 0)
        return res.status(200).json({ success: false, message: 'Bạn đã thêm sản phẩm này vào giỏ hàng' });

      sql = `INSERT INTO Cart (UserId, ProdId) VALUES (?, ?)`;
      await db.query(sql, [req.user.Id, productId]);

      return res.status(201).json({ success: true, message: 'Đã thêm sản phẩm vào giỏ hàng' });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ success: false, message: 'Lỗi máy chủ', data: e });
    }
  }

  async update(req: any, res: any) {
    const cartItems = req.body;

    try {
      const queries = cartItems.map((item) => ({
        sql: `UPDATE Cart SET Quantity = ? WHERE Id = ? AND Status = ? AND UserId = ?`,
        params: [item.quantity, item.id, 'Active', req.user.Id],
      }));

      await db.queryAll(queries);
      res.json({ success: true, message: 'Cập nhật giỏ hàng thành công' });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ success: false, message: 'Lỗi máy chủ', data: e });
    }
  }

  async delete(req: any, res: any) {
    const { cartId } = req.body;

    if (!cartId) return res.status(400).json({ success: false, message: 'Vui lòng nhập đầy đủ thông tin' });

    try {
      await db.query(`UPDATE Cart SET Status = ? WHERE Id = ? AND UserId = ?`, ['Inactive', cartId, req.user.Id]);
      return res.status(200).json({ success: true, message: 'Đã xoá sản phẩm khỏi giỏ hàng' });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ success: false, message: 'Lỗi máy chủ', data: e });
    }
  }
}

export const cartController = new CartController();

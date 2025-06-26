import { db } from '~/configs/dbConnect';

class CartService {
  async getCartByUser(userId: string) {
    const query = `
          SELECT 
            C.Id, C.ProdId, C.Quantity, C.Status, C.createdAt, C.updatedAt,
            P.Image, P.ProdName, P.Price, P.Slugs, P.Discount 
          FROM Cart C
          LEFT JOIN Product P ON C.ProdId = P.Id
          WHERE C.UserId = ?
          ORDER BY C.updatedAt DESC
        `;
    return await db.query(query, [userId]);
  }

  async deleteCartOfUser(userId: string) {
    const exists = await this.getCartByUser(userId);
    if (exists.length === 0) {
      return { message: 'No cart found for this user.' };
    }

    const query = `DELETE FROM Cart WHERE UserId = ?`;
    await db.query(query, [userId]);
    return { message: 'Cart deleted successfully.' };
  }

  async deleteCartOfProduct(productId: string) {
    const exists = await db.query(`SELECT * FROM Cart WHERE ProdId = ?`, [productId]);
    if (exists.length === 0) {
      return { message: 'No cart found for this product.' };
    }

    const query = `DELETE FROM Cart WHERE ProdId = ?`;
    await db.query(query, [productId]);
    return { message: 'Cart deleted successfully.' };
  }
}

export const cartService = new CartService();

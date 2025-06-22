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
}

export const cartService = new CartService();

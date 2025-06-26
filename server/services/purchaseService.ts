import { db } from '~/configs/dbConnect';

class PurchaseService {
  async deletePurchaseOfProduct(productId: string) {
    const exists = await db.query(`SELECT * FROM PurchaseHistory WHERE ProdId = ?`, [productId]);
    if (exists.length === 0) {
      return { message: 'No purchase records found for this product.' };
    }

    const query = `DELETE FROM PurchaseHistory WHERE ProdId = ?`;
    await db.query(query, [productId]);
    return { message: 'Purchase records deleted successfully.' };
  }
}

export const purchaseService = new PurchaseService();

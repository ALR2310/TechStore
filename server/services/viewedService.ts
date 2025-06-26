import { db } from '~/configs/dbConnect';

class ViewedService {
  async deleteViewedOfProduct(productId: string) {
    const exists = await db.query(`SELECT * FROM ProductViewed WHERE ProdId = ?`, [productId]);
    if (exists.length === 0) {
      return { message: 'No viewed records found for this product.' };
    }

    const query = `DELETE FROM ProductViewed WHERE ProdId = ?`;
    await db.query(query, [productId]);
    return { message: 'Viewed records deleted successfully.' };
  }
}

export const viewedService = new ViewedService();

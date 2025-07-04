import { getStatisticPayload } from '@shared/types/params.type';
import { db } from '~/configs/dbConnect';
import { buildDateFilter } from '~/utils/query.build';

const formatMap = {
  day: '%Y-%m-%d',
  month: '%Y-%m',
  year: '%Y',
};

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

  async getStatistic(payload: getStatisticPayload) {
    const { by = 'day', startDate, endDate } = payload;

    const groupFormat = formatMap[by];
    const dateQuery = buildDateFilter(startDate, endDate);

    const viewCountQuery = `
      SELECT 
        strftime('${groupFormat}', createdAt) as label,
        COUNT(*) as count
      FROM ProductViewed
      ${dateQuery.query}
      GROUP BY label
      ORDER BY label ASC;
    `;

    const totalViewQuery = `SELECT COUNT(*) as total FROM ProductViewed;`;

    const viewByProductQuery = `
      SELECT 
        ProdId,
        COUNT(*) as count
      FROM ProductViewed
      ${dateQuery.query}
      GROUP BY ProdId
      ORDER BY count DESC;
    `;

    const [viewCount, totalView, viewByProduct] = await Promise.all([
      db.query(viewCountQuery, dateQuery.params),
      db.query(totalViewQuery, dateQuery.params),
      db.query(viewByProductQuery, dateQuery.params),
    ]);

    return {
      totalView: Number(totalView[0]?.total || 0),
      viewCount: viewCount.map((r: any) => ({
        label: r.label,
        count: Number(r.count),
      })),
      viewByProduct: viewByProduct.map((r: any) => ({
        productId: r.ProdId,
        count: Number(r.count),
      })),
    };
  }
}

export const viewedService = new ViewedService();

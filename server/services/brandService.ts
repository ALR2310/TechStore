import { baseQueryParams } from '@shared/types/params.type';
import { db } from '~/configs/dbConnect';

class BrandService {
  async getListBrand(payload: baseQueryParams & { status?: string }) {
    const { keyword, page = 1, limit = 10, sortBy = 'updatedAt', sortDir = 'desc', status } = payload;

    const offset = (page - 1) * limit;
    const safeSortDir = sortDir === 'asc' ? 'ASC' : 'DESC';

    let query = `SELECT * FROM Brands`;

    const conditions: string[] = [];
    const params: any[] = [];

    if (keyword) {
      conditions.push(`BrandName LIKE ?`);
      params.push(`%${keyword}%`);
    }

    if (status) {
      conditions.push(`Status = ?`);
      params.push(status);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ` ORDER BY ${sortBy} ${safeSortDir} LIMIT ? OFFSET ?`;

    const baseCountQuery = `SELECT COUNT(*) as total FROM Brands`;
    const countQuery = conditions.length > 0 ? baseCountQuery + ' WHERE ' + conditions.join(' AND ') : baseCountQuery;

    const [brands, total] = await Promise.all([
      db.query(query, [...params, limit, offset]),
      db.query(countQuery, params),
    ]);

    // Get brand series for each brand
    for (const brand of brands) {
      const seriesQuery = `SELECT Id, SeriesName FROM BrandSeries WHERE BrandId = ?`;
      const series = await db.query(seriesQuery, [brand.Id]);
      brand.Series = series;
    }

    return {
      data: brands,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: Number(total[0].total),
        totalPages: Math.ceil(Number(total[0].total) / Number(limit)),
      },
    };
  }
}

export const brandService = new BrandService();

import { baseQueryParams } from '@shared/types/params.type';
import { db } from '~/configs/dbConnect';

class CategoryService {
  async getListCategory(payload: baseQueryParams) {
    const { keyword, page = 1, limit = 10, sortBy = 'updatedAt', sortDir = 'desc' } = payload;

    const offset = (page - 1) * limit;
    const safeSortDir = sortDir === 'asc' ? 'ASC' : 'DESC';

    let query = `SELECT * FROM Categories`;

    const conditions: string[] = [];
    const params: any[] = [];

    if (keyword) {
      conditions.push(`(CateName LIKE ? OR Slugs LIKE ?)`);
      params.push(`%${keyword}%`, `%${keyword}%`);
    }
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ` ORDER BY ${sortBy} ${safeSortDir} LIMIT ? OFFSET ?`;

    const baseCountQuery = `SELECT COUNT(*) as total FROM Categories`;

    const countQuery = conditions.length > 0 ? baseCountQuery + ' WHERE ' + conditions.join(' AND ') : baseCountQuery;

    const [categories, total] = await Promise.all([
      db.query(query, [...params, limit, offset]),
      db.query(countQuery, params),
    ]);

    return {
      data: categories,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: Number(total[0].total),
        totalPages: Math.ceil(Number(total[0].total) / Number(limit)),
      },
    };
  }
}

export const categoryService = new CategoryService();

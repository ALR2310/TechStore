import { baseQueryParams } from '@shared/types/params.type';
import { db } from '~/configs/dbConnect';

class CategoryService {
  async getListCategory(payload: baseQueryParams) {
    const { keyword, page = 1, limit = 10, sortBy = 'updatedAt', sortDir = 'desc' } = payload;

    const offset = (page - 1) * limit;
    const safeSortDir = sortDir === 'asc' ? 'ASC' : 'DESC';

    let query = `SELECT C.*, COUNT(P.Id) as ProdCount
      FROM Categories C
      LEFT JOIN Product P ON P.CateId = C.Id
      GROUP BY C.Id`;

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

  async getCategory(id: string) {
    const query = `SELECT * FROM Categories WHERE Id = ?`;
    const category = await db.query(query, [id]);

    if (category.length === 0) {
      throw new Error('Category not found.');
    }

    const products = await db.query(`SELECT Id, ProdName FROM Product WHERE CateId = ?`, [id]);

    return { ...category[0], products };
  }

  async deleteCategory(id: string) {
    const exists = await db.query(`SELECT * FROM Categories WHERE Id = ?`, [id]);
    if (exists.length === 0) {
      throw new Error('Category not found.');
    }

    const query = `DELETE FROM Categories WHERE Id = ?`;
    await db.query(query, [id]);
    return { message: 'Category deleted successfully.' };
  }
}

export const categoryService = new CategoryService();

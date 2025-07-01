import { createCategoryPayload, updateCategoryPayload } from '@shared/types/category.type';
import { baseQueryParams } from '@shared/types/params.type';
import dayjs from 'dayjs';
import { db } from '~/configs/dbConnect';

class CategoryService {
  async getListCategory(payload: baseQueryParams) {
    const { keyword, page = 1, limit = 10, sortBy = 'updatedAt', sortDir = 'desc' } = payload;

    const offset = (page - 1) * limit;
    const safeSortDir = sortDir === 'asc' ? 'ASC' : 'DESC';

    let query = `SELECT C.*, COUNT(P.Id) as ProdCount FROM Categories C LEFT JOIN Product P ON P.CateId = C.Id`;

    const conditions: string[] = [];
    const params: any[] = [];

    if (keyword) {
      conditions.push(`(CateName LIKE ?)`);
      params.push(`%${keyword}%`);
    }
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' GROUP BY C.Id';
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

  async createCategory(payload: createCategoryPayload) {
    const { name, slug, status = 'Active' } = payload;

    if (!name || !slug) {
      throw new Error('Name and slug are required.');
    }

    const exists = await db.query(`SELECT * FROM Categories WHERE Slugs = ?`, [slug]);
    if (exists.length > 0) {
      throw new Error('Category with this slug already exists.');
    }

    const dateNow = dayjs().format('YYYY-MM-DD HH:mm:ss');
    const query = `INSERT INTO Categories (CateName, Slugs, Status, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)`;
    await db.query(query, [name, slug, status, dateNow, dateNow]);

    return { message: 'Category created successfully.' };
  }

  async updateCategory(payload: updateCategoryPayload) {
    const { id, name, slug, status } = payload;

    if (!id || !name || !slug) {
      throw new Error('ID, name, and slug are required.');
    }

    const exists = await db.query(`SELECT * FROM Categories WHERE Id = ?`, [id]);
    if (exists.length === 0) {
      throw new Error('Category not found.');
    }

    const slugExists = await db.query(`SELECT * FROM Categories WHERE Slugs = ? AND Id != ?`, [slug, id]);
    if (slugExists.length > 0) {
      throw new Error('Category with this slug already exists.');
    }

    const dateNow = dayjs().format('YYYY-MM-DD HH:mm:ss');
    const query = `UPDATE Categories SET CateName = ?, Slugs = ?, Status = ?, updatedAt = ? WHERE Id = ?`;
    await db.query(query, [name, slug, status, dateNow, id]);

    return { message: 'Category updated successfully.' };
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

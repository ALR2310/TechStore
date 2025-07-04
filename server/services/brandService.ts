import { createBrandPayload, updateBrandPayload } from '@shared/types/brand.type';
import { baseQueryParams } from '@shared/types/params.type';
import { isNullOrEmpty } from '@shared/utils/general.utils';
import dayjs from 'dayjs';
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

  async getBrand(id: string) {
    const query = `SELECT * FROM Brands WHERE Id = ?`;
    const brand = await db.query(query, [id]);

    if (brand.length === 0) {
      throw new Error('Brand not found');
    }

    const seriesQuery = `SELECT Id, SeriesName, Status FROM BrandSeries WHERE BrandId = ?`;
    const series = await db.query(seriesQuery, [id]);

    return {
      ...brand[0],
      Series: series,
    };
  }

  async createBrand(payload: createBrandPayload) {
    const { name, status, series } = payload;

    const dateNow = dayjs().format('YYYY-MM-DD HH:mm:ss');
    const query = `INSERT INTO Brands (BrandName, Status, createdAt, updatedAt) VALUES (?, ?, ?, ?)`;
    const result = await db.query(query, [name, status, dateNow, dateNow]);

    if (series && series.length > 0) {
      const brandId = result.insertId;
      const seriesQueries = series.map((item) => {
        return db.query(`INSERT INTO BrandSeries (BrandId, SeriesName) VALUES (?, ?)`, [brandId, item.name]);
      });
      await Promise.all(seriesQueries);
    }
  }

  async updateBrand(payload: updateBrandPayload) {
    const { name, status, series, idsDelete } = payload;

    const dateNow = dayjs().format('YYYY-MM-DD HH:mm:ss');
    const query = `UPDATE Brands SET BrandName = ?, Status = ?, updatedAt = ? WHERE Id = ?`;
    await db.query(query, [name, status, dateNow, payload.id]);

    if (series && series.length > 0) {
      for (const item of series) {
        if (!isNullOrEmpty(item.name)) {
          if (item.id) {
            await db.query(`UPDATE BrandSeries SET SeriesName = ? WHERE Id = ?`, [item.name, item.id]);
          } else {
            await db.query(`INSERT INTO BrandSeries (BrandId, SeriesName) VALUES (?, ?)`, [payload.id, item.name]);
          }
        }
      }
    }

    if (idsDelete && idsDelete.length > 0) {
      for (const id of idsDelete) {
        await db.query(`DELETE FROM BrandSeries WHERE Id = ?`, [id]);
      }
    }
  }

  async deleteBrand(id: string) {
    const query = `DELETE FROM Brands WHERE Id = ?`;
    await db.query(query, [id]);

    const seriesQuery = `DELETE FROM BrandSeries WHERE BrandId = ?`;
    await db.query(seriesQuery, [id]);
  }
}

export const brandService = new BrandService();

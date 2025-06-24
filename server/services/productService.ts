import { getListProductParams } from '@shared/types/product.type';
import { isNullOrEmpty } from '@shared/utils/general.utils';
import { db } from '~/configs/dbConnect';

class ProductService {
  async getListProduct(payload: getListProductParams) {
    const {
      keyword,
      page = 1,
      limit = 10,
      sortBy = 'updatedAt',
      sortDir = 'desc',
      status,
      category,
      brand,
      quantityFrom,
      quantityTo,
      priceFrom,
      priceTo,
    } = payload;

    const offset = (page - 1) * limit;
    const safeSortDir = sortDir === 'asc' ? 'ASC' : 'DESC';

    let query = `
      SELECT
        P.Id as Id,
        C.Id as CateId,
        C.CateName as Category,
        B.Id as BrandId,
        B.BrandName as Brand,
        BS.SeriesName as Series,
        P.Image as Image,
        P.ProdName as Name,
        P.Quantity as Quantity,
        P.Price as Price,
        P.Discount as Discount,
        P.Status as Status,
        P.createdAt as createdAt,
        P.updatedAt as updatedAt
      FROM Product P
      LEFT JOIN Categories C ON P.CateId = C.Id
      LEFT JOIN Brands B ON P.BrandId = B.Id
      LEFT JOIN BrandSeries BS ON BrandSeriesId = BS.Id
    `;

    const conditions: string[] = [];
    const params: any[] = [];

    if (keyword) {
      conditions.push(
        `(P.ProdName LIKE ? OR C.CateName LIKE ? OR B.BrandName LIKE ? OR BS.SeriesName LIKE ? OR P.Price LIKE ? OR P.Discount LIKE ?)`,
      );
      params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`, `%${keyword}%`, `%${keyword}%`, `%${keyword}%`);
    }

    if (status) {
      conditions.push('P.Status = ?');
      params.push(status);
    }

    if (category) {
      conditions.push('P.CateId = ?');
      params.push(category);
    }

    if (brand) {
      conditions.push('P.BrandId = ?');
      params.push(brand);
    }

    if (!isNullOrEmpty(quantityFrom?.toString()) && !isNullOrEmpty(quantityTo?.toString())) {
      conditions.push('P.Quantity BETWEEN ? AND ?');
      params.push(quantityFrom, quantityTo);
    }

    if (!isNullOrEmpty(priceFrom?.toString()) && !isNullOrEmpty(priceTo?.toString())) {
      conditions.push('P.Price BETWEEN ? AND ?');
      params.push(priceFrom, priceTo);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ` ORDER BY ${sortBy} ${safeSortDir} LIMIT ? OFFSET ?`;

    const baseCountQuery = `
      SELECT COUNT(*) as total
      FROM Product P
      LEFT JOIN Categories C ON P.CateId = C.Id
      LEFT JOIN Brands B ON P.BrandId = B.Id
      LEFT JOIN BrandSeries BS ON BrandSeriesId = BS.Id`;

    const countQuery = conditions.length > 0 ? baseCountQuery + ' WHERE ' + conditions.join(' AND ') : baseCountQuery;

    try {
      const [products, total] = await Promise.all([
        db.query(query, [...params, limit, offset]),
        db.query(countQuery, params),
      ]);

      return {
        data: products,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: Number(total[0].total),
          totalPages: Math.ceil(Number(total[0].total) / Number(limit)),
        },
      };
    } catch (error) {
      console.error('Error fetching product list:', error);
      throw new Error('Internal Server Error');
    }
  }

  async getProduct(id: string) {
    const query = `
      SELECT
        P.Id as Id,
        C.Id as CateId,
        C.CateName as Category,
        B.Id as BrandId,
        B.BrandName as Brand,
        BS.SeriesName as Series,
        P.Image as Image,
        P.ProdName as Name,
        P.Quantity as Quantity,
        P.Price as Price,
        P.Discount as Discount,
        P.Status as Status,
        ROUND(IFNULL(AVG(PR.Rating), 0), 1) AS AvgRating,
        COUNT(PR.Id) AS TotalRating,
        PD.DeviceCfg as DeviceCfg,
        PD.Content as Content,
        P.createdAt as createdAt,
        P.updatedAt as updatedAt
      FROM Product P
      LEFT JOIN ProductDetails PD ON P.Id = PD.ProdId
      LEFT JOIN Categories C ON P.CateId = C.Id
      LEFT JOIN Brands B ON P.BrandId = B.Id
      LEFT JOIN BrandSeries BS ON P.BrandSeriesId = BS.Id
      LEFT JOIN ProductReviews PR ON P.Id = PR.ProdId AND PR.Status = 'Active'
      WHERE P.Id = ?`;

    const product = await db.query(query, [id]);

    return product[0];
  }
}

export const productService = new ProductService();

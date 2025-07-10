import { getStatisticPayload } from '@shared/types/params.type';
import { createProductPayload, getListProductParams, updateProductPayload } from '@shared/types/product.type';
import { isNullOrEmpty } from '@shared/utils/general.utils';
import { db } from '~/configs/dbConnect';
import { buildDateFilter } from '~/utils/query.build';

const formatMap = {
  day: '%Y-%m-%d',
  month: '%Y-%m',
  year: '%Y',
};

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
        BS.Id as SeriesId,
        BS.SeriesName as Series,
        P.Image as Image,
        P.Slugs as Slugs,
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

  async getProductsByBrand(brandId: string) {
    const query = `SELECT Id, ProdName FROM Product WHERE BrandId = ?`;
    const products = await db.query(query, [brandId]);
    return products;
  }

  async getProductsBySeries(seriesId: string) {
    const query = `SELECT Id, ProdName FROM Product WHERE BrandSeriesId = ?`;
    const products = await db.query(query, [seriesId]);
    return products;
  }

  async createProduct(payload: createProductPayload) {
    const { name, slug, category, brand, series, image, quantity, price, discount, status, content, deviceConfigs } =
      payload;

    if (category) {
      const categoryExists = await db.query('SELECT Id FROM Categories WHERE Id = ?', [category]);
      if (categoryExists.length === 0) {
        throw new Error('Category does not exist');
      }
    }

    if (brand) {
      const brandExists = await db.query('SELECT Id FROM Brands WHERE Id = ?', [brand]);
      if (brandExists.length === 0) {
        throw new Error('Brand does not exist');
      }
    }

    if (series) {
      const seriesExists = await db.query('SELECT Id FROM BrandSeries WHERE Id = ?', [series]);
      if (seriesExists.length === 0) {
        throw new Error('Brand series does not exist');
      }
    }

    if (name) {
      const existingProduct = await db.query('SELECT Id FROM Product WHERE ProdName = ?', [name]);
      if (existingProduct.length > 0) {
        throw new Error('Product name already exists');
      }
    }

    let query = `
        INSERT INTO Product (CateId, BrandId, BrandSeriesId, Image, ProdName, Quantity, Price, Discount, Slugs, Status, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    let params = [
      category,
      brand,
      series,
      image,
      name,
      quantity,
      price,
      discount,
      slug,
      status,
      "DATETIME('now')",
      "DATETIME('now')",
    ];

    const result = await db.query(query, params);
    const productId = result.insertId;

    await db.query(
      'INSERT INTO ProductDetails (ProdId, DeviceCfg, Content, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)',
      [productId, deviceConfigs, content, "DATETIME('now')", "DATETIME('now')"],
    );

    return this.getProduct(productId);
  }

  async updateProduct(payload: updateProductPayload) {
    const {
      id,
      name,
      slug,
      category,
      brand,
      series,
      image,
      quantity,
      price,
      discount,
      status,
      content,
      deviceConfigs,
    } = payload;

    if (isNullOrEmpty(id)) {
      throw new Error('Product ID is required');
    } else {
      const idExists = await db.query('SELECT Id FROM Product WHERE Id = ?', [id]);
      if (idExists.length === 0) {
        throw new Error('Product does not exist');
      }
    }

    if (category) {
      const categoryExists = await db.query('SELECT Id FROM Categories WHERE Id = ?', [category]);
      if (categoryExists.length === 0) {
        throw new Error('Category does not exist');
      }
    }

    if (brand) {
      const brandExists = await db.query('SELECT Id FROM Brands WHERE Id = ?', [brand]);
      if (brandExists.length === 0) {
        throw new Error('Brand does not exist');
      }
    }

    if (series) {
      const seriesExists = await db.query('SELECT Id FROM BrandSeries WHERE Id = ?', [series]);
      if (seriesExists.length === 0) {
        throw new Error('Brand series does not exist');
      }
    }

    let query = `UPDATE Product SET`;

    const conditions: string[] = [];
    const params: any[] = [];

    if (name) {
      conditions.push('ProdName = ?');
      params.push(name);
    }
    if (slug) {
      conditions.push('Slugs = ?');
      params.push(slug);
    }
    if (category) {
      conditions.push('CateId = ?');
      params.push(category);
    }
    if (brand) {
      conditions.push('BrandId = ?');
      params.push(brand);
    }
    if (series) {
      conditions.push('BrandSeriesId = ?');
      params.push(series);
    }
    if (image) {
      conditions.push('Image = ?');
      params.push(image);
    }
    if (!isNullOrEmpty(quantity?.toString())) {
      conditions.push('Quantity = ?');
      params.push(quantity);
    }
    if (!isNullOrEmpty(price?.toString())) {
      conditions.push('Price = ?');
      params.push(price);
    }
    if (!isNullOrEmpty(discount?.toString())) {
      conditions.push('Discount = ?');
      params.push(discount);
    }
    if (status) {
      conditions.push('Status = ?');
      params.push(status);
    }
    conditions.push("updatedAt = DATETIME('now')");
    if (conditions.length > 0) {
      query += ` ${conditions.join(', ')} WHERE Id = ?`;
      params.push(id);
      await db.query(query, params);
    }

    let detailQuery = `UPDATE ProductDetails SET`;
    const detailConditions: string[] = [];
    const detailParams: any[] = [];

    if (deviceConfigs) {
      detailConditions.push('DeviceCfg = ?');
      detailParams.push(deviceConfigs);
    }
    if (content) {
      detailConditions.push('Content = ?');
      detailParams.push(content);
    }
    detailConditions.push("updatedAt = DATETIME('now')");
    if (detailConditions.length > 0) {
      detailQuery += ` ${detailConditions.join(', ')} WHERE ProdId = ?`;
      detailParams.push(id);
      await db.query(detailQuery, detailParams);
    }

    return this.getProduct(id);
  }

  async deleteProduct(id: string) {
    if (isNullOrEmpty(id)) {
      throw new Error('Product ID is required');
    } else {
      const idExists = await db.query('SELECT Id FROM Product WHERE Id = ?', [id]);
      if (idExists.length === 0) {
        throw new Error('Product does not exist');
      }
    }

    const query = 'DELETE FROM Product WHERE Id = ?';
    await db.query(query, [id]);
    await db.query('DELETE FROM ProductDetails WHERE ProdId = ?', [id]);

    return { message: 'Product deleted successfully' };
  }

  async getStatistic(payload: getStatisticPayload) {
    const { by = 'day', startDate, endDate } = payload;

    const groupFormat = formatMap[by];
    const dateQuery = buildDateFilter(startDate, endDate);

    const productsQuery = `
      SELECT 
        Id,
        ProdName as Name,
        Status
      FROM Product
      ${dateQuery.query}
    `;

    const totalProductQuery = `
      SELECT COUNT(*) as total FROM Product
      ${dateQuery.query};
    `;

    const bestSellingQuery = `
      SELECT 
        strftime('${groupFormat}', o.createdAt) as datetime,
        p.ProdName as name,
        p.Price,
        SUM(oi.Quantity) as totalSold
      FROM OrderItems oi
      JOIN Orders o ON o.Id = oi.OrdId
      JOIN Product p ON p.Id = oi.ProdId
      ${dateQuery.query.replace(/createdAt/g, 'o.createdAt')}
      GROUP BY datetime, oi.ProdId
      ORDER BY datetime ASC, totalSold DESC;
    `;

    const [products, total, bestSelling] = await Promise.all([
      db.query(productsQuery, dateQuery.params),
      db.query(totalProductQuery, dateQuery.params),
      db.query(bestSellingQuery, dateQuery.params),
    ]);

    return {
      totalProduct: total[0]?.total || 0,
      productByStatus: products.reduce((acc: Record<string, { id: number; name: string }[]>, row: any) => {
        if (!acc[row.Status]) acc[row.Status] = [];
        acc[row.Status].push({ id: row.Id, name: row.Name });
        return acc;
      }, {}),
      bestSellingProducts: bestSelling.map((r: any) => ({
        datetime: r.datetime,
        name: r.name,
        price: Number(r.Price),
        totalSold: Number(r.totalSold),
      })),
    };
  }
}

export const productService = new ProductService();

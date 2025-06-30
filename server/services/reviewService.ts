import { getListReviewPayload } from '@shared/types/review.type';
import { db } from '~/configs/dbConnect';

class ReviewService {
  async getListReview(payload: getListReviewPayload) {
    const {
      keyword,
      page = 1,
      limit = 10,
      sortBy = 'updatedAt',
      sortDir = 'desc',
      status,
      ratingFrom = 0,
      ratingTo = 5,
      product,
      user,
    } = payload;

    const offset = (page - 1) * limit;
    const safeSortDir = sortDir === 'asc' ? 'ASC' : 'DESC';

    let query = `
      SELECT 
        PR.Id as Id, PR.UserName AS ReviewerName, PR.Rating AS Rating, PR.Comment AS Comment, PR.Status AS Status, PR.createdAt AS createdAt, PR.updatedAt AS updatedAt,
        P.ProdName AS ProductName, P.Image AS ProductImage, P.Slugs AS ProductSlugs, P.Price AS ProductPrice,
        UI.FullName AS UserFullName
      FROM ProductReviews PR
      LEFT JOIN Product P ON PR.ProdId = P.Id
      LEFT JOIN UserInfo UI ON PR.UserId = UI.UserId`;

    const conditions: string[] = [];
    const params: any[] = [];

    if (keyword) {
      conditions.push(`(PR.Comment LIKE ? OR UI.FullName LIKE ? OR P.ProdName LIKE ?)`);
      params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`);
    }

    if (status) {
      conditions.push(`(PR.Status = ?)`);
      params.push(status);
    }

    if (ratingFrom || ratingTo) {
      conditions.push(`(PR.Rating BETWEEN ? AND ?)`);
      params.push(ratingFrom, ratingTo);
    }

    if (product) {
      conditions.push(`(P.Id = ?)`);
      params.push(product);
    }

    if (user) {
      conditions.push(`(PR.UserId = ?)`);
      params.push(user);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    query += ` ORDER BY PR.${sortBy} ${safeSortDir} LIMIT ? OFFSET ?`;

    let baseCountQuery = `SELECT COUNT(*) AS total FROM ProductReviews PR
      LEFT JOIN Product P ON PR.ProdId = P.Id LEFT JOIN UserInfo UI ON PR.UserId = UI.UserId`;
    const countQuery = conditions.length > 0 ? `${baseCountQuery} WHERE ${conditions.join(' AND ')}` : baseCountQuery;

    const [reviews, total] = await Promise.all([
      db.query(query, [...params, limit, offset]),
      db.query(countQuery, params),
    ]);

    return {
      data: reviews,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: Number(total[0].total),
        totalPages: Math.ceil(Number(total[0].total) / Number(limit)),
      },
    };
  }

  async getReviewByUser(userId: string) {
    const query = `SELECT * FROM ProductReviews WHERE UserId = ? ORDER BY updatedAt DESC`;
    return await db.query(query, [userId]);
  }

  async deleteReviewOfUser(userId: string) {
    const exists = await this.getReviewByUser(userId);
    if (exists.length === 0) {
      return { message: 'No reviews found for this user.' };
    }

    const query = `DELETE FROM ProductReviews WHERE UserId = ?`;
    await db.query(query, [userId]);
    return { message: 'Reviews deleted successfully.' };
  }

  async deleteReviewOfProduct(productId: string) {
    const exists = await db.query(`SELECT * FROM ProductReviews WHERE ProdId = ?`, [productId]);
    if (exists.length === 0) {
      return { message: 'No reviews found for this product.' };
    }

    const query = `DELETE FROM ProductReviews WHERE ProdId = ?`;
    await db.query(query, [productId]);
    return { message: 'Reviews deleted successfully.' };
  }
}

export const reviewService = new ReviewService();

import { getStatisticPayload } from '@shared/types/params.type';
import { getListReviewPayload } from '@shared/types/review.type';
import { isNullOrEmpty } from '@shared/utils/general.utils';
import { db } from '~/configs/dbConnect';
import { buildDateFilter } from '~/utils/query.build';

const formatMap = {
  day: '%Y-%m-%d',
  month: '%Y-%m',
  year: '%Y',
};

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
        UI.UserId AS UserId, UI.FullName AS UserFullName
      FROM ProductReviews PR
      LEFT JOIN Product P ON PR.ProdId = P.Id
      LEFT JOIN UserInfo UI ON PR.UserId = UI.UserId`;

    const conditions: string[] = [];
    const params: any[] = [];

    if (keyword) {
      conditions.push(`(PR.Comment LIKE ? OR P.ProdName LIKE ?)`);
      params.push(`%${keyword}%`, `%${keyword}%`);
    }

    if (status) {
      conditions.push(`(PR.Status = ?)`);
      params.push(status);
    }

    if (!isNullOrEmpty(ratingFrom.toString()) || !isNullOrEmpty(ratingTo.toString())) {
      conditions.push(`(PR.Rating BETWEEN ? AND ?)`);
      params.push(ratingFrom, ratingTo);
    }

    if (product) {
      conditions.push(`(P.Slugs LIKE ?)`);
      params.push(`%${product}%`);
    }

    if (user) {
      conditions.push(`(PR.UserId = ?)`);
      params.push(user);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    query += ` ORDER BY ${sortBy} ${safeSortDir} LIMIT ? OFFSET ?`;

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

  async updateStatusReview(reviewId: string, status: string) {
    const exists = await db.query(`SELECT * FROM ProductReviews WHERE Id = ?`, [reviewId]);
    if (exists.length === 0) {
      throw new Error('Review not found.');
    }

    const query = `UPDATE ProductReviews SET Status = ? WHERE Id = ?`;
    await db.query(query, [status, reviewId]);
    return { message: 'Review status updated successfully.' };
  }

  async deleteReview(reviewId: string) {
    const exists = await db.query(`SELECT * FROM ProductReviews WHERE Id = ?`, [reviewId]);
    if (exists.length === 0) {
      throw new Error('Review not found.');
    }

    const query = `DELETE FROM ProductReviews WHERE Id = ?`;
    await db.query(query, [reviewId]);
    return { message: 'Review deleted successfully.' };
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

  async getStatistic(payload: getStatisticPayload) {
    const { by = 'day', startDate, endDate } = payload;

    const groupFormat = formatMap[by];
    const dateQuery = buildDateFilter(startDate, endDate);

    const totalReviewQuery = `SELECT COUNT(*) as total FROM ProductReviews;`;

    const reviewCountQuery = `
      SELECT 
        strftime('${groupFormat}', createdAt) as label,
        COUNT(*) as value
      FROM ProductReviews
      ${dateQuery.query}
      GROUP BY label
      ORDER BY label ASC;
    `;

    const starCountQuery = `
      SELECT 
        Rating AS label,
        COUNT(*) as value
      FROM ProductReviews
      ${dateQuery.query}
      GROUP BY label
      ORDER BY label ASC;
    `;

    const topProductReviewQuery = `
      SELECT
        strftime('${groupFormat}', PR.createdAt) as datetime,
        P.ProdName as productName,
        COUNT(*) as count
      FROM ProductReviews PR
      JOIN Product P ON PR.ProdId = P.Id
      ${dateQuery.query.replace(/createdAt/g, 'PR.createdAt')}
      GROUP BY datetime, PR.ProdId
      ORDER BY datetime ASC, count DESC;
    `;

    const topReviewerQuery = `
      SELECT 
        UI.FullName as label,
        COUNT(*) as value
      FROM ProductReviews PR
      JOIN UserInfo UI ON PR.UserId = UI.UserId
     ${dateQuery.query.replace(/createdAt/g, 'PR.createdAt')}
      GROUP BY label
      ORDER BY value DESC;
    `;

    const [totalReview, reviewCount, starCount, topProductReview, topReviewer] = await Promise.all([
      db.query(totalReviewQuery),
      db.query(reviewCountQuery, dateQuery.params),
      db.query(starCountQuery, dateQuery.params),
      db.query(topProductReviewQuery, dateQuery.params),
      db.query(topReviewerQuery, dateQuery.params),
    ]);

    return {
      totalReview: totalReview[0]?.total || 0,
      reviewCount,
      starCount,
      topProductReview,
      topReviewer,
    };
  }
}

export const reviewService = new ReviewService();

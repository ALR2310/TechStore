import { db } from '~/configs/dbConnect';

class ReviewService {
  async getReviewByUser(userId: string) {
    const query = `SELECT * FROM ProductReviews WHERE UserId = ? ORDER BY updatedAt DESC`;
    return await db.query(query, [userId]);
  }
}

export const reviewService = new ReviewService();

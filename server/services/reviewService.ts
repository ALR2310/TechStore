import { db } from '~/configs/dbConnect';

class ReviewService {
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
}

export const reviewService = new ReviewService();

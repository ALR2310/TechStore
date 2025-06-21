import { db } from '~/configs/dbConnect';

interface getListUserPayload {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  role?: string;
  status?: string;
  keyword?: string;
}

class UserService {
  async getListUser(payload: getListUserPayload) {
    const { keyword, page = 1, limit = 10, role, status, sortBy = 'U.updatedAt', sortDir = 'desc' } = payload;

    const offset = (page - 1) * limit;
    const safeSortDir = sortDir === 'asc' ? 'ASC' : 'DESC';

    let query = `
        SELECT U.Id, U.Email, U.UserName, U.Role, U.Status, U.updatedAt, UI.FullName, UI.PhoneNumber, UI.DoB
        FROM User U
        LEFT JOIN UserInfo UI ON U.Id = UI.UserId
      `;

    const conditions: string[] = [];
    const params: any[] = [];

    if (status) {
      conditions.push('U.Status = ?');
      params.push(status);
    }

    if (role) {
      conditions.push('U.Role = ?');
      params.push(role);
    }

    if (keyword) {
      conditions.push(`(U.Email LIKE ? OR U.UserName LIKE ? OR UI.FullName LIKE ?)`);
      params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ` ORDER BY ${sortBy} ${safeSortDir} LIMIT ? OFFSET ?`;

    const baseCountQuery = `
        SELECT COUNT(*) AS total
        FROM User U
        LEFT JOIN UserInfo UI ON U.Id = UI.UserId
      `;

    const countQuery = conditions.length > 0 ? `${baseCountQuery} WHERE ${conditions.join(' AND ')}` : baseCountQuery;

    const [users, total] = await Promise.all([
      db.query(query, [...params, limit, offset]),
      db.query(countQuery, params),
    ]);

    return {
      data: users,
      pagination: {
        page,
        limit,
        total: total[0].total,
        totalPages: Math.ceil(total[0].total / limit),
      },
    };
  }
}

export const userService = new UserService();

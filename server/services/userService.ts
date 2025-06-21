import { getListUserPayload } from '@shared/types/user.type';
import { db } from '~/configs/dbConnect';

class UserService {
  async getListUser(payload: getListUserPayload) {
    const {
      keyword,
      page = 1,
      limit = 10,
      role,
      status,
      dateOfBirth,
      sortBy = 'updatedAt',
      sortDir = 'desc',
    } = payload;

    const offset = (page - 1) * limit;
    const safeSortDir = sortDir === 'asc' ? 'ASC' : 'DESC';

    let query = `
        SELECT 
            U.Id as Id, 
            U.Email as Email, 
            U.UserName as UserName,
            U.Role as Role, 
            U.Status as Status, 
            U.updatedAt as updatedAt, 
            UI.FullName as FullName, 
            UI.PhoneNumber as PhoneNumber, 
            UI.DoB as DoB
        FROM User U
        LEFT JOIN UserInfo UI ON U.Id = UI.UserId
      `;

    const conditions: string[] = [];
    const params: any[] = [];

    if (status) {
      conditions.push('U.Status = ?');
      params.push(status);
    }

    if (dateOfBirth) {
      conditions.push('UI.DoB = ?');
      params.push(dateOfBirth);
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

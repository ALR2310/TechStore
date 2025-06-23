import { getListUserPayload, updateUserPayload } from '@shared/types/user.type';
import bcrypt from 'bcryptjs';
import dayjs from 'dayjs';
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
        page: Number(page),
        limit: Number(limit),
        total: Number(total[0].total),
        totalPages: Math.ceil(Number(total[0].total) / Number(limit)),
      },
    };
  }

  async getUser(id: string) {
    const query = `
      SELECT 
          U.Id as Id, 
          U.Email as Email,
          U.UserName as UserName,
          U.Role as Role,
          U.Status as Status,
          U.updatedAt as updatedAt,
          UI.FullName as FullName,
          UI.PhoneNumber as PhoneNumber,
          UI.DoB as DoB,
          UI.Gender as Gender
      FROM User U
      LEFT JOIN UserInfo UI ON U.Id = UI.UserId
      WHERE U.Id = ?  
    `;

    const user = await db.query(query, [id]);

    if (user.length === 0) {
      throw new Error('User not found');
    }

    return user[0];
  }

  async updateUser(payload: updateUserPayload) {
    const { id, email, role, status, password, fullName, phoneNumber, dateOfBirth, gender } = payload;

    const user = await db.query('SELECT 1 FROM User WHERE Id = ?', [id]);

    if (user.length === 0) {
      throw new Error('User not found');
    }

    let hashPwd: string = '';
    if (password) {
      hashPwd = await bcrypt.hash(password, 10);
    }

    const updateUserConditions: string[] = [];
    const userParams: any[] = [];

    const updateUserInfoConditions: string[] = [];
    const userInfoParams: any[] = [];

    if (email) {
      updateUserConditions.push('Email = ?');
      userParams.push(email);
    }

    if (role) {
      updateUserConditions.push('Role = ?');
      userParams.push(role);
    }

    if (status) {
      updateUserConditions.push('Status = ?');
      userParams.push(status);
    }

    if (hashPwd) {
      updateUserConditions.push('Password = ?');
      userParams.push(hashPwd);
    }

    if (updateUserConditions.length > 0) {
      const updateUserQuery = `
      UPDATE User 
      SET ${updateUserConditions.join(', ')} 
      WHERE Id = ?
    `;

      userParams.push(id);
      await db.query(updateUserQuery, userParams);
    }

    if (fullName) {
      updateUserInfoConditions.push('FullName = ?');
      userInfoParams.push(fullName);
    }

    if (phoneNumber) {
      updateUserInfoConditions.push('PhoneNumber = ?');
      userInfoParams.push(phoneNumber);
    }

    if (dateOfBirth) {
      updateUserInfoConditions.push('DoB = ?');
      userInfoParams.push(dayjs(dateOfBirth).format('YYYY-MM-DD HH:mm:ss'));
    }

    if (gender) {
      updateUserInfoConditions.push('Gender = ?');
      userInfoParams.push(gender);
    }

    if (userInfoParams.length > 0) {
      const updateUserInfoQuery = `
        UPDATE UserInfo 
        SET ${updateUserInfoConditions.join(', ')} 
        WHERE UserId = ?
      `;

      userInfoParams.push(id);
      await db.query(updateUserInfoQuery, userInfoParams);
    }

    return this.getUser(id);
  }

  async deleteUser(id: string) {
    const user = await db.query('SELECT 1 FROM User WHERE Id = ?', [id]);

    if (user.length === 0) {
      throw new Error('User not found');
    }

    await db.query('DELETE FROM UserInfo WHERE UserId = ?', [id]);
    await db.query('DELETE FROM User WHERE Id = ?', [id]);

    return user[0];
  }
}

export const userService = new UserService();

import sqlite3 from 'sqlite3';
import path from 'path';

const database = new sqlite3.Database(path.resolve(__dirname, '..', '..', 'techstore.db'));

interface Query {
  sql: string;
  params?: any[];
}

export const db = {
  /**
   * Thực hiện một truy vấn SQL
   * @param sql - Chuỗi truy vấn
   * @param params - Tham số truy vấn
   *
   * @example
   * // Truy vấn không tham số
   * const result = await db.query('SELECT * FROM user')
   *
   * // Truy vấn có tham số
   * const result = await db.query('SELECT * FROM user WHERE username = ?', ['admin'])
   */
  query: (sql: string, params: any[] = []): Promise<any> => {
    return new Promise((resolve, reject) => {
      const isSelect = sql.trim().toLowerCase().startsWith('select');
      if (isSelect)
        database.all(sql, params, (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      else
        database.run(sql, params, function (this: sqlite3.RunResult, err: Error | null) {
          if (err) reject(err);
          else resolve({ insertId: this.lastID, changes: this.changes });
        });
    });
  },

  /**
   * Thực hiện nhiều truy vấn SQL cùng lúc
   * @param queries - Danh sách chuỗi truy vấn
   *
   * @example
   * // Truy vấn không tham số
   * const [getUser, getProduct] = await db.queryAll([
   *     { sql: 'SELECT * FROM user' },
   *     { sql: 'SELECT * FROM product' }
   * ]);
   *
   * // Truy vấn có tham số
   * const [checkUsername, checkEmail] = await db.queryAll([
   *     { sql: 'SELECT * FROM user WHERE username = ?', params: [username] },
   *     { sql: 'SELECT * FROM user WHERE email = ?', params: [email] }
   * ]);
   */
  queryAll: (queries: Query[] = []): Promise<any[]> => {
    const promises = queries.map((query) => db.query(query.sql, query.params));
    return Promise.all(promises);
  },
};

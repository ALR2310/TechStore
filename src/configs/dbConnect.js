const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    waitForConnections: true,
    connectionLimit: 10,
    maxIdle: 10,
    idleTimeout: 60000,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
});

const db = {
    /**
     * Thực hiện một truy vấn SQL
     * @param {string} sql - Chuỗi truy vấn
     * @param {array} params - Tham số truy vấn
     *
     * @example
     * // Truy vấn không tham số
     * const result = await db.query('SELECT * FROM user')
     *
     * // Truy vấn có tham số
     * const result = await db.query('SELECT * FROM user WHERE username = ?', ['admin'])
     * */
    query: async (sql = '', params = []) => {
        const connection = await pool.getConnection();
        const result = (await connection.query(sql, params))[0];
        connection.release();
        return result;
    },

    /**
     * Thực hiện nhiều truy vấn SQL cùng lúc
     * @param {array} queries - Danh sách chuỗi truy vấn
     *
     * @example
     * // Truy vấn không tham số
     * const [getUser, getProduct] = await db.queryAll([]
     *     { sql: 'SELECT * FROM user' },
     *     { sql: 'SELECT * FROM product' }
     * ]);
     *
     * // Truy vấn có tham số
     * const [checkUsername, checkEmail] = await db.queryAll([
     *     { sql: 'SELECT * FROM user WHERE username = ?', params: [username] },
     *     { sql: 'SELECT * FROM user WHERE email = ?', params: [email] }
     * ]);
     * */
    queryAll: async (queries = [{ sql: '', params: [] }]) => {
        const promise = queries.map(query => {
            return db.query(query.sql, query.params);
        });
        return await Promise.all(promise);
    }
};

module.exports = db;
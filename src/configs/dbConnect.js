const mysql = require('mysql2/promise');

async function connection() {
    return await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
    });
}

const db = connection();

module.exports = db;
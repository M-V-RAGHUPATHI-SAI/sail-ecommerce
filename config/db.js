import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST ? process.env.MYSQL_HOST.replace(/'/g, '') : 'localhost',
    user: process.env.MYSQL_USER ? process.env.MYSQL_USER.replace(/'/g, '') : 'root',
    password: process.env.MYSQL_PASSWORD ? process.env.MYSQL_PASSWORD.replace(/'/g, '') : '',
    database: process.env.MYSQL_DATABASE ? process.env.MYSQL_DATABASE.replace(/'/g, '') : 'saildb'
});

// Create a pool instead of a single connection for better performance and reliability in a web app
const pool = mysql.createPool({
    host: process.env.MYSQL_HOST ? process.env.MYSQL_HOST.replace(/'/g, '') : 'localhost',
    user: process.env.MYSQL_USER ? process.env.MYSQL_USER.replace(/'/g, '') : 'root',
    password: process.env.MYSQL_PASSWORD ? process.env.MYSQL_PASSWORD.replace(/'/g, '') : '',
    database: process.env.MYSQL_DATABASE ? process.env.MYSQL_DATABASE.replace(/'/g, '') : 'saildb',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

export default pool;

import pool from './config/db.js';

async function fetchUser() {
    try {
        const [rows] = await pool.execute('SELECT email FROM customer LIMIT 1');
        if(rows.length > 0) {
            console.log(`Found user: ${rows[0].email}`);
        } else {
            console.log("No users in db.");
        }
    } catch(err) {
        console.error(err);
    } finally {
        process.exit(0);
    }
}

fetchUser();

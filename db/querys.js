const {Pool} = require("pg");



const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});


async function findUserById(userId) {
    const user = await pool.query(
        "SELECT id, username, profile_img_url FROM users WHERE id = $1",
        [userId]
    );
    return user;
};

async function findUserByUsername(username) {
    const user = await pool.query(
        "SELECT * FROM users WHERE username = $1",
        [username]
    );
    return user;
};



module.exports = {
    findUserById,
    findUserByUsername
};
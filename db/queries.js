const pool = require("./pool.js");



async function findUserById(userId) {
    const {rows} = await pool.query(
        "SELECT id, username, profile_img_url FROM users WHERE id = $1",
        [userId]
    );

    if (rows.length === 0) {
        return null;
    }
    const user = rows[0];
    return user;
};

async function findUserByUsername(username) {
    const {rows} = await pool.query(
        "SELECT * FROM users WHERE username = $1",
        [username]
    );

    if (rows.length === 0) {
        return null;
    }
    const user = rows[0];
    return user;
};

async function findUserByEmail(email) {
    const {rows} = await pool.query(
        "SELECT * FROM users WHERE email = $1",
        [email]
    );

    if (rows.length === 0) {
        return null;
    }
    const user = rows[0];
    return user;
};

async function createUser(email, username, password) {
    const {rows} = await pool.query(
        "INSERT INTO users (email, username, password) VALUES ($1, $2, $3) RETURNING *",
        [email, username, password]
    );

    if (rows.length === 0) {
        return null;
    }
    const user = rows[0];
    return user;
};



module.exports = {
    findUserById,
    findUserByUsername,
    findUserByEmail,
    createUser
};
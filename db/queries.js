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

async function createPost(userId, title, content) {
    const {rows} = await pool.query(
        "INSERT INTO posts (author_id, title, content) VALUES ($1, $2, $3) RETURNING *",
        [userId, title, content]
    );
    const post = rows[0];
    return post;
};

async function getPosts(orderBy) {
    const {rows} = await pool.query(
        "SELECT p.id AS post_id, p.title, p.timestamp AS date, COUNT(post_id) AS likes, u.id AS author_id, u.username, u.profile_img_url FROM posts AS p JOIN users AS u ON u.id = p.author_id LEFT JOIN post_likes AS pl ON pl.post_id = p.id GROUP BY p.id, u.id ORDER BY $1",
        [orderBy]
    );
    return rows;
};



module.exports = {
    findUserById,
    findUserByUsername,
    findUserByEmail,
    createUser,
    createPost,
    getPosts
};
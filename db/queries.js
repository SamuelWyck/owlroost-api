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

async function getPosts(orderByLikes, limit, offset) {
    const orderBy = (orderByLikes) ? "likes" : "date";
    const sql = `SELECT p.id AS post_id, p.title, p.timestamp AS date, COUNT(post_id) AS likes, u.id AS author_id, u.username, u.profile_img_url FROM posts AS p JOIN users AS u ON u.id = p.author_id LEFT JOIN post_likes AS pl ON pl.post_id = p.id GROUP BY p.id, u.id ORDER BY ${orderBy} DESC, u.username DESC LIMIT $1 OFFSET $2`;

    const {rows} = await pool.query(sql, [limit, offset]);
    return rows;
};

async function getPost(postId) {
    const {rows} = await pool.query(
        "SELECT p.id, p.title, p.content, p.timestamp, COUNT(pl.id) AS likes, u.username, u.profile_img_url FROM posts AS p LEFT JOIN post_likes AS pl ON pl.post_id = p.id JOIN users AS u ON u.id = p.author_id WHERE p.id = $1 GROUP BY p.id, u.id",
        [postId]
    );
    const post = rows[0];
    return post;
};


async function updatePost(title, content, postId, userId) {
    const {rows} = await pool.query(
        "UPDATE posts SET title = $1, content = $2 WHERE id = $3 AND author_id = $4 RETURNING *",
        [title, content, postId, userId]
    );
    const post = rows[0];
    return post;
};


async function deletePost(postId, userId) {
    const {rows} = await pool.query(
        "DELETE FROM posts WHERE id = $1 AND author_id = $2 RETURNING *",
        [postId, userId]
    );
    const post = rows[0];
    return post;
};


async function getPostComments(postId) {
    const {rows} = await pool.query(
        "SELECT c.id, c.content, c.author_id, c.timestamp, u.username, u.profile_img_url FROM comments AS c JOIN users AS u ON u.id = c.author_id WHERE c.post_id = $1",
        [postId]
    );
    return rows;
};


async function getPostLike(postId, userId) {
    const {rows} = await pool.query(
        "SELECT * FROM post_likes WHERE post_id = $1 AND user_id = $2",
        [postId, userId]
    );
    const postLike = (rows[0]) ? rows.length === 1 : null;
    return postLike;
};


async function createPostLike(postId, userId) {
    const {rows} = await pool.query(
        "INSERT INTO post_likes (post_id, user_id) VALUES ($1, $2) RETURNING *",
        [postId, userId]
    );
    const postLike = (rows[0]) ? rows.length === 1 : null;
    return postLike;
};


async function deletePostLike(postId, userId) {
    const {rows} = await pool.query(
        "DELETE FROM post_likes WHERE post_id = $1 AND user_id = $2 RETURNING *",
        [postId, userId]
    );
    const postLike = (rows[0]) ? rows.length === 1 : null;
    return postLike;
};


async function createComment(postId, userId, content) {
    const {rows} = await pool.query(
        "INSERT INTO comments (post_id, author_id, content) VALUES ($1, $2, $3) RETURNING *",
        [postId, userId, content]
    );
    const comment = (rows.length === 1) ? rows[0] : null;
    return comment;
};



module.exports = {
    findUserById,
    findUserByUsername,
    findUserByEmail,
    createUser,
    createPost,
    getPosts,
    getPost,
    updatePost,
    deletePost,
    getPostComments,
    getPostLike,
    createPostLike,
    deletePostLike,
    createComment
};
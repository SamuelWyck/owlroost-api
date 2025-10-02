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


async function getPostComments(postId, takeNum, offset) {
    const {rows} = await pool.query(
        "SELECT c.id, c.content, c.author_id, c.timestamp, u.username, u.profile_img_url FROM comments AS c JOIN users AS u ON u.id = c.author_id WHERE c.post_id = $1 ORDER BY c.timestamp DESC, u.username DESC LIMIT $2 OFFSET $3",
        [postId, takeNum, offset]
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


async function deleteComment(commentId, userId) {
    const {rows} = await pool.query(
        "DELETE FROM comments WHERE id = $1 AND author_id = $2 RETURNING *",
        [commentId, userId]
    );
    const comment = (rows.length === 1) ? rows[0] : null;
    return comment;
};


async function updateComment(content, commentId, userId) {
    const {rows} = await pool.query(
        "UPDATE comments SET content = $1 WHERE id = $2 AND author_id = $3 RETURNING *",
        [content, commentId, userId]
    );
    const comment = (rows.length === 1) ? rows[0] : null;
    return comment;
};


async function getUserPosts(userId) {
    const {rows} = await pool.query(
        "SELECT p.id AS post_id, p.title, p.content, COUNT(pl.id) AS likes, p.timestamp AS date, p.author_id, u.username, u.profile_img_url FROM posts AS p JOIN users AS u ON u.id = p.author_id LEFT JOIN post_likes AS pl on pl.post_id = p.id WHERE u.id = $1 GROUP BY p.id, u.id",
        [userId]
    );
    return rows;
};


async function getUserProfile(userId, requestingUser) {
    let user = null;
    let follow_requests = null;
    if (requestingUser) {
        [user, follow_requests] = await Promise.all([
            pool.query("SELECT u.id, u.username, u.profile_img_url, u.info, ARRAY_AGG(JSON_BUILD_OBJECT('id', fu.id, 'username', fu.username, 'profile_img_url', fu.profile_img_url)) AS followed FROM users AS u LEFT JOIN followed_users AS f ON f.following_user_id = u.id LEFT JOIN users AS fu ON fu.id = f.followed_user_id WHERE u.id = $1 GROUP BY u.id", [userId]),
            pool.query("SELECT fr.id AS request_id, su.id AS sending_user_id, su.username AS sending_user_username, su.profile_img_url AS sending_user_img, ru.id AS receiving_user_id, ru.username AS receiving_user_username, ru.profile_img_url AS receiving_user_img FROM follow_requests AS fr JOIN users AS su ON su.id = fr.requesting_user_id JOIN users AS ru ON ru.id = fr.receiving_user_id WHERE fr.receiving_user_id = $1 OR fr.requesting_user_id = $1", [userId])
        ]);
        user = (user.rows.length === 1) ? user.rows[0] : null;
        follow_requests = follow_requests.rows;
    } else {
        const {rows} = await pool.query("SELECT u.id, u.username, u.profile_img_url, u.info, ARRAY_AGG(JSON_BUILD_OBJECT('id', fu.id, 'username', fu.username, 'profile_img_url', fu.profile_img_url)) AS followed FROM users AS u LEFT JOIN followed_users AS f ON f.following_user_id = u.id LEFT JOIN users AS fu ON fu.id = f.followed_user_id WHERE u.id = $1 GROUP BY u.id", [userId]);
        user = (rows.length === 1) ? rows[0] : null;
    }
    return {user, follow_requests};
};


async function getUsers(userId, nameSearch, limit, offset) {
    // let SQL = `SELECT u.id, u.username, u.profile_img_url, ARRAY_AGG(sr.receiving_user_id) AS sent_requests, ARRAY_AGG(rr.requesting_user_id) AS received_requests, ARRAY_AGG(fu.followed_user_id) AS followed_users, ARRAY_AGG(uf.following_user_id) AS following_users FROM users AS u LEFT JOIN follow_requests AS sr ON sr.requesting_user_id = u.id LEFT JOIN follow_requests AS rr ON rr.receiving_user_id = u.id LEFT JOIN followed_users AS fu ON fu.following_user_id = u.id LEFT JOIN followed_users AS uf ON uf.followed_user_id = u.id WHERE u.id != $1 AND u.username ILIKE $2 GROUP BY u.id ORDER BY u.username ASC, u.id DESC LIMIT $3 OFFSET $4`;
    let SQL = `SELECT u.id, u.username, u.profile_img_url, ARRAY_AGG(rr.requesting_user_id) AS received_requests, ARRAY_AGG(uf.following_user_id) AS following_users FROM users AS u LEFT JOIN follow_requests AS rr ON rr.receiving_user_id = u.id LEFT JOIN followed_users AS uf ON uf.followed_user_id = u.id WHERE u.id != $1 AND u.username ILIKE $2 GROUP BY u.id ORDER BY u.username ASC, u.id DESC LIMIT $3 OFFSET $4`;
    let args = [userId, `${nameSearch}%`, limit, offset];
    if (!userId) {
        // SQL = `SELECT u.id, u.username, u.profile_img_url, ARRAY_AGG(sr.receiving_user_id) AS sent_requests, ARRAY_AGG(rr.requesting_user_id) AS received_requests, ARRAY_AGG(fu.followed_user_id) AS followed_users, ARRAY_AGG(uf.following_user_id) AS following_users FROM users AS u LEFT JOIN follow_requests AS sr ON sr.requesting_user_id = u.id LEFT JOIN follow_requests AS rr ON rr.receiving_user_id = u.id LEFT JOIN followed_users AS fu ON fu.following_user_id = u.id LEFT JOIN followed_users AS uf ON uf.followed_user_id = u.id WHERE u.username ILIKE $1 GROUP BY u.id ORDER BY u.username ASC, u.id DESC LIMIT $2 OFFSET $3`;
        SQL = `SELECT u.id, u.username, u.profile_img_url, ARRAY_AGG(rr.requesting_user_id) AS received_requests, ARRAY_AGG(uf.following_user_id) AS following_users FROM users AS u LEFT JOIN follow_requests AS rr ON rr.receiving_user_id = u.id LEFT JOIN followed_users AS uf ON uf.followed_user_id = u.id WHERE u.username ILIKE $1 GROUP BY u.id ORDER BY u.username ASC, u.id DESC LIMIT $2 OFFSET $3`;
        args = [`${nameSearch}%`, limit, offset];
    }

    const {rows} = await pool.query(SQL, args);
    return rows;
};


async function createFollowReq(userId, reqUserId) {
    const {rows} = await pool.query(
        "INSERT INTO follow_requests (requesting_user_id, receiving_user_id) VALUES ($1, $2) RETURNING *",
        [reqUserId, userId]
    );
    const req = (rows.length === 1) ? rows[0] : null;
    return req;
};


async function deleteFollowReq(recUserId, reqUserId) {
    const {rows} = await pool.query(
        "DELETE FROM follow_requests WHERE requesting_user_id = $1 AND receiving_user_id = $2 RETURNING *",
        [reqUserId, recUserId]
    );
    const request = (rows.length === 1) ? rows[0] : null;
    return request;
};


async function createFollow(followedUserId, followingUserId) {
    const {rows} = await pool.query(
        "INSERT INTO followed_users (followed_user_id, following_user_id) VALUES ($1, $2) RETURNING *",
        [followedUserId, followingUserId]
    );
    const follow = (rows.length === 1) ? rows[0] : null;
    return follow;
};


async function deleteFollow(followedUserId, followingUserId) {
    const {rows} = await pool.query(
        "DELETE FROM followed_users WHERE following_user_id = $1 AND followed_user_id = $2 RETURNING *",
        [followingUserId, followedUserId]
    );
    const follow = (rows.length === 1) ? rows[0] : null;
    return follow;
};


async function isFollowingUser(userId, followedUserId) {
    if (!userId) {
        return false;
    }
    if (userId === followedUserId) {
        return false;
    }

    const {rows} = await pool.query(
        "SELECT * FROM followed_users AS fu FULL JOIN follow_requests AS fr ON fr.requesting_user_id = fu.following_user_id WHERE (fu.following_user_id = $1 AND fu.followed_user_id = $2) OR (fr.requesting_user_id = $1 AND fr.receiving_user_id = $2)",
        [userId, followedUserId]
    );
    return rows.length === 1;
};


async function updateUserInfo(userId, info) {
    const {rows} = await pool.query(
        "UPDATE users SET info = $2 WHERE id = $1 RETURNING id",
        [userId, info]
    );
    const user = (rows.length === 1) ? rows[0] : null;
    return user;
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
    createComment,
    deleteComment,
    updateComment,
    getUserPosts,
    getUserProfile,
    getUsers,
    createFollowReq,
    deleteFollowReq,
    createFollow,
    deleteFollow,
    isFollowingUser,
    updateUserInfo
};
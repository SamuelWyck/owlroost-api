CREATE TABLE IF NOT EXISTS "users" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(250) UNIQUE NOT NULL,
    username VARCHAR(250) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    profile_img_url VARCHAR(600),
    profile_public_id VARCHAR(600),
    info VARCHAR(3000)
);

CREATE TABLE IF NOT EXISTS "posts" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID NOT NULL,
    title VARCHAR(200) NOT NULL,
    content VARCHAR(11000) NOT NULL,
    timestamp TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP, 
    CONSTRAINT fk_post_author_id FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE 
);

CREATE TABLE IF NOT EXISTS "comments" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID NOT NULL,
    post_id UUID NOT NULL,
    content VARCHAR(6000),
    timestamp TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP, 
    CONSTRAINT fk_comment_author_id FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_parent_post_id FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "post_likes" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    post_id UUID NOT NULL,
    CONSTRAINT fk_user_like_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_post_id FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "followed_users" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    following_user_id UUID NOT NULL,
    followed_user_id UUID NOT NULL,
    CONSTRAINT fk_following_user_id FOREIGN KEY (following_user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_followed_user_id FOREIGN KEY (followed_user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "follow_requests" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requesting_user_id UUID NOT NULL,
    receiving_user_id UUID NOT NULL,
    CONSTRAINT fk_requesting_user_id FOREIGN KEY (requesting_user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_receiving_user_id FOREIGN KEY (receiving_user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE "session" (
  "sid" varchar NOT NULL COLLATE "default",
  "sess" json NOT NULL,
  "expire" timestamp(6) NOT NULL
)
WITH (OIDS=FALSE);

ALTER TABLE "session" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;

CREATE INDEX "IDX_session_expire" ON "session" ("expire");
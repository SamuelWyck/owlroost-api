const {Router} = require("express");
const postsController = require("../controllers/postsController.js");
const {isLoggedIn} = require("../utils/authMiddleware.js");



const postsRoute = Router();


postsRoute.get("/", postsController.postsGet);
postsRoute.post("/new", isLoggedIn, postsController.newPostPost);
postsRoute.get("/:postId", postsController.postGet);
postsRoute.put("/:postId/edit", isLoggedIn, postsController.postEditPut);
postsRoute.delete("/:postId/delete", isLoggedIn, postsController.deletePostDelete);
postsRoute.post("/:postId/like", isLoggedIn, postsController.togglePostLike);



module.exports = postsRoute;
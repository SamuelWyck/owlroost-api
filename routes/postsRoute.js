const {Router} = require("express");
const postsController = require("../controllers/postsController.js");
const {isLoggedIn} = require("../utils/authMiddleware.js");



const postsRoute = Router();


postsRoute.get("/", postsController.postsGet);
postsRoute.post("/new", isLoggedIn, postsController.newPostPost);
postsRoute.get("/:postId/edit", isLoggedIn, postsController.postEditGet);
postsRoute.put("/:postId/edit", isLoggedIn, postsController.postEditPut);



module.exports = postsRoute;
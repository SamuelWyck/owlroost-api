const {Router} = require("express");
const commentsController = require("../controllers/commentController.js");
const {isLoggedIn} = require("../utils/authMiddleware.js");



const commentsRoute = Router();

commentsRoute.get("/:postId", commentsController.commentsGet);
commentsRoute.post("/new", isLoggedIn, commentsController.createCommentPost);
commentsRoute.delete("/:commentId/delete", isLoggedIn, commentsController.delCommentDelete);
commentsRoute.put("/:commentId/edit", isLoggedIn, commentsController.editCommentPut);



module.exports = commentsRoute;

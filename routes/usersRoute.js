const {Router} = require("express");
const usersController = require("../controllers/usersController.js");
const {isLoggedIn} = require("../utils/authMiddleware.js");



const userRoute = Router();


userRoute.get("/", usersController.usersGet);
userRoute.get("/:userId", usersController.userProfileGet);
userRoute.get("/:userId/posts", usersController.userPostsGet);
userRoute.get("/:userId/comments", usersController.userCommentsGet);
userRoute.post("/:userId/follow", isLoggedIn, usersController.followUserPost);
userRoute.delete("/:userId/unfollow", isLoggedIn, usersController.unfollowUserDel);
userRoute.post("/:userId/accept-follow", isLoggedIn, usersController.acceptFollowPost);
userRoute.delete("/:userId/reject-follow", isLoggedIn, usersController.rejectFollowDel);
userRoute.put("/update-info", isLoggedIn, usersController.updateUserInfoPut);



module.exports = userRoute;
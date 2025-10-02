const {Router} = require("express");
const usersController = require("../controllers/usersController.js");
const {isLoggedIn} = require("../utils/authMiddleware.js");



const userRoute = Router();


userRoute.get("/", usersController.usersGet);
userRoute.get("/:userId", usersController.userProfileGet);
userRoute.get("/:userId/posts", usersController.userPostsGet);
userRoute.post("/:userId/follow", isLoggedIn, usersController.followUserPost);
userRoute.delete("/:userId/unfollow", isLoggedIn, usersController.unfollowUserDel);
userRoute.put("/update-info", isLoggedIn, usersController.updateUserInfoPut);



module.exports = userRoute;
const {Router} = require("express");
const usersController = require("../controllers/usersController.js");
const {isLoggedIn} = require("../utils/authMiddleware.js");
const upload = require("../utils/multer.js");



const userRoute = Router();


userRoute.get("/", usersController.usersGet);
userRoute.get("/:userId", usersController.userProfileGet);
userRoute.get("/:userId/posts", usersController.userPostsGet);
userRoute.get("/:userId/comments", usersController.userCommentsGet);
userRoute.get("/:userId/followed-posts", usersController.userFollowedPostsGet);
userRoute.post("/:userId/follow", isLoggedIn, usersController.followUserPost);
userRoute.delete("/:userId/unfollow", isLoggedIn, usersController.unfollowUserDel);
userRoute.post("/:userId/accept-follow", isLoggedIn, usersController.acceptFollowPost);
userRoute.delete("/:userId/reject-follow", isLoggedIn, usersController.rejectFollowDel);
userRoute.put("/update-info", isLoggedIn, usersController.updateUserInfoPut);
userRoute.post("/upload-image", isLoggedIn, upload.single("image"), usersController.uploadUserImgPost);
userRoute.delete("/delete-image", isLoggedIn, usersController.deleteUserImgPost);



module.exports = userRoute;
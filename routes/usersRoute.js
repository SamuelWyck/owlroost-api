const {Router} = require("express");
const usersController = require("../controllers/usersController.js");



const userRoute = Router();


userRoute.get("/:userId/posts", usersController.userPostsGet);
userRoute.get("/:userId", usersController.userProfileGet);
userRoute.get("/", usersController.usersGet);



module.exports = userRoute;
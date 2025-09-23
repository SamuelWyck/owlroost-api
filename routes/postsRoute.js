const {Router} = require("express");
const postsController = require("../controllers/postsController.js");



const postsRoute = Router();


postsRoute.get("/", postsController.postsGet);



module.exports = postsRoute;
const express = require("express");
const loginRouter = express.Router();

const authController = require("../crontroller/authController");

loginRouter.post("/set-admin", authController.tempAdmin);
loginRouter.post("/check-user", authController.login);
loginRouter.post("/log-out", authController.logout);


module.exports = loginRouter;

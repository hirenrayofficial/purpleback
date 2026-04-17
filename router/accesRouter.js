const express = require('express');
const accessRouter = express.Router()
const userControll = require('../crontroller/userController')
const isAdmin = require('../auth/adminAuth')
const maAuth = require('../auth/maAuth')





accessRouter.get("/check",userControll.checkUser)
accessRouter.get("/get-ov-dt",maAuth,userControll.getAlloverDetails)
accessRouter.post("/create-user",isAdmin, userControll.createUser)
accessRouter.get("/get-user-list",maAuth, userControll.getUserlist)
accessRouter.get("/get-puser-list",maAuth,userControll.getPeningUserlist)
accessRouter.put("/update-user/:id",maAuth,userControll.updateUser)
accessRouter.put("/approve-user/:suUserId",maAuth,userControll.approveUser)
accessRouter.put("/update-profile-name/:id",userControll.updateProfileName)
accessRouter.put("/change-password/:id",userControll.changePassword)
accessRouter.delete("/delete-user/:id",userControll.deleteAccount)


module.exports = accessRouter
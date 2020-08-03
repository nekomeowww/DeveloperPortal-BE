// Dependencies
const KoaRouter = require('koa-router')

// Local Dependencies
const info = require('../controllers/info')
const getAvatar = require('../controllers/avatar')
const { uploadAppIcon } = require('../controllers/app')
const { avatar, nickname, email } = require('../controllers/update')

let user = new KoaRouter()

user.get("/info", info)
user.get("/avatar", getAvatar)
user.get("/update/email", email)
user.get("/update/avatar", avatar)
user.get("/update/nickname", nickname)
user.post("/:userId/app/:id/uploadAppIcon", uploadAppIcon)

module.exports = user
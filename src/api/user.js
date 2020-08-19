// Dependencies
const KoaRouter = require('koa-router')

// Local Dependencies
const info = require('../controllers/info')
const getAvatar = require('../controllers/avatar')
const { app, uploadAppIcon } = require('../controllers/app')
const { team, uploadTeamIcon } = require('../controllers/team')
const { avatar, nickname, email } = require('../controllers/update')
const { uploadTeamAppIcon } = require('../controllers/team/app')

let user = new KoaRouter()

user.get("/info", info)
user.get("/avatar", getAvatar)
user.get("/app", app)
user.get("/team", team),
user.get("/update/email", email)
user.get("/update/avatar", avatar)
user.get("/update/nickname", nickname)
user.post("/:userId/app/:id/uploadAppIcon", uploadAppIcon)
user.post("/:userId/team/:id/uploadTeamIcon", uploadTeamIcon)
user.post("/:userId/team/:id/app/:appId/uploadTeamAppIcon", uploadTeamAppIcon)

module.exports = user
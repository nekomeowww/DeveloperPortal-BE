const KoaRouter = require('koa-router')

const { invite, inviteUpdate } = require('../controllers/invite')

let inviteRouter = new KoaRouter()

inviteRouter.get("/", invite)
inviteRouter.get("/update", inviteUpdate)

module.exports = inviteRouter
// Dependencies
const KoaRouter = require('koa-router')

// Local Package
const login = require('../controllers/login')

const LoginRouter = new KoaRouter()

LoginRouter.get('/', login)

module.exports = LoginRouter
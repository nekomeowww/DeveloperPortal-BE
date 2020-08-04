// Dependencies
const KoaRouter = require('koa-router')

// Local Package
const getImg = require('../controllers/img')

const ImgRouter = new KoaRouter

ImgRouter.get("/:imgName", getImg)

module.exports = ImgRouter
// Dependencies
const fs = require('fs')
const path = require('path')

// Local Packages
const Log = require('../util/log')
const Hash = require('../util/hash')
const Store = require('../store/store')

let app = async (ctx, next) => {

    let query = ctx.request.query
    query = JSON.parse(JSON.stringify(query))

    if (query.id === undefined || query.id === "undefined" || query.id === "null") {
        ctx.body = { status: "failed", message: "Invalid Request, Missing value on required field `id`" }
        await next()
        return
    }

    let app = await Store.user.findOne({ key: "AppProfile", id: query.id })
    ctx.body = app
    await next()
}

let newApp = async (ctx, next) => {
    let body = ctx.request.body
    body.code = 0
    ctx.body = body
    await next()
}

let getAppIcon = async (ctx, next) => {
    let query = ctx.request.query
    query = JSON.parse(JSON.stringify(query))

    if (query.userId === undefined || query.userId === "undefined" || query.userId === "null") {
        ctx.body = { status: "failed", message: "Invalid Request, Missing value on required field `userId`" }
        await next()
        return
    }

    if (query.appId === undefined || query.appId === "undefined" || query.appId === "null") {
        ctx.body = { status: "failed", message: "Invalid Request, Missing value on required field `appId`" }
        await next()
        return
    }

    const types = {
        png: 'image/png',
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        gif: 'image/gif',
        webp: 'image/webp',
    }

    let app = await Store.user.findOne({ key: "AppProfile", appId: query.appId, userId: query.userId })
    
    if (!app) {
        await next()
        return
    }

    let ext = app.img.split('.')[1]

    ctx.type = types[ext]
    ctx.body = fs.createReadStream('./data/img/' + app.img)
    await next()
}

let uploadAppIcon = async (ctx, next) => {
    let query = ctx.request.query
    query = JSON.parse(JSON.stringify(query))

    let dataDir = path.resolve("./data")
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir)
    }

    let imgServeDir = path.resolve("./data/img")
    if (!fs.existsSync(imgServeDir)) {
        fs.mkdirSync(imgServeDir)
    }
    
    const file = ctx.request.files;
    const ext = file.image.name.split(".")[1]
    const fileName = Hash.sha256(Date.now() + '').substring(0,10) + '.' + ext
    const reader = fs.createReadStream(file.image.path);
    const stream = fs.createWriteStream('./data/img/' + fileName)
    reader.pipe(stream)
    Log.trace('uploading %s -> %s', file.image.name, stream.path)

    let isExist = await Store.user.findOne({ key: "AppProfile", appid: ctx.params.id, userId: ctx.params.userId })
    if (!isExist) {
        await Store.user.insert({ key: "AppProfile", appId: ctx.params.id, userId: ctx.params.userId, img: fileName})
        await Store.user.update({ key: "AppProfiles", id: ctx.params.userId }, { $addToSet: { apps: ctx.params.id } }, {})
        Log.trace("Creating new app, id: " + ctx.params.id)
    }
    else {
        await Store.user.update({ key: "AppProfile", appId: ctx.params.id, userId: ctx.params.userId}, { $set: { img: fileName } }, {})
        await Store.user.update({ key: "AppProfiles", id: ctx.params.userId }, { $addToSet: { apps: ctx.params.id } }, {})
        Log.trace("Updating app, id: " + ctx.params.id)
    }

    ctx.body = { code: 0, message: "success", img: "/" + fileName}
    await next
}

module.exports = {
    app,
    getAppIcon,
    newApp,
    uploadAppIcon
}
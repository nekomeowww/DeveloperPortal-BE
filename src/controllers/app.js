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

    let app = await Store.user.findOne({ key: "AppProfiles", id: parseInt(query.id) })
    ctx.body = app
    await next()
}

let newApp = async (ctx, next) => {
    let body = ctx.request.body
    let isExist = await Store.user.findOne({ key: "AppProfile", appId: body.appId, userId: parseInt(body.userId) })
    let clientId = []
    let clientSecret = ''
    for (let i = 0; i < 15; i++) {
        clientId.push(Math.floor(Math.random() * Math.floor(9)))
    }
    clientId = clientId.join('')
    clientSecret = Hash.sha256(Date.now() + '').substring(0, 16)

    if (!/https?:\/\//.test(body.form.callback)) {
        body.form.callback = 'https://' + body.form.callback
    }

    if (!isExist) {

        const appId = Hash.sha256(Date.now() + '').substring(0, 16)

        await Store.user.insert({ key: "AppProfileSecret", appId: appId, userId: parseInt(body.userId), clientId: clientId, clientSecret: clientSecret })
        await Store.user.insert({ key: "AppProfile", appId: appId, userId: parseInt(body.userId), detail: body.form })
        await Store.user.update({ key: "AppProfiles", id: parseInt(body.userId) }, { $addToSet: { apps: appId } }, {})

        Log.trace("Creating new app with information, id: " + appId)
        ctx.body = { code: 0, message: 'success', appId: appId, body: body }
    }
    else {

        let app = await Store.user.findOne({ key: "AppProfileSecret", appId: body.appId, userId: parseInt(body.userId) })
        if (!app.clientId) {
            await Store.user.insert({ key: "AppProfileSecret", appId: body.appId, userId: parseInt(body.userId), clientId: clientId, clientSecret: clientSecret })
        }

        await Store.user.update({ key: "AppProfile", appId: body.appId, userId: parseInt(body.userId) }, { $set: { detail: body.form } }, {})
        await Store.user.update({ key: "AppProfiles", id: parseInt(body.userId) }, { $addToSet: { apps: body.appId } }, {})

        Log.trace("Updating app information, id: " + body.appId)
        ctx.body = { code: 1, message: "success", appId: body.appId, body: body }
    }

    await next()
}

let removeApp = async (ctx, next) => {
    let query = ctx.request.query
    query = JSON.parse(JSON.stringify(query))

    if (query.appId === undefined || query.appId === "undefined" || query.appId === "null") {
        ctx.body = { status: "failed", message: "Invalid Request, Missing value on required field `appId`" }
        await next()
        return
    }

    if (query.userId === undefined || query.userId === "undefined" || query.userId === "null") {
        ctx.body = { status: "failed", message: "Invalid Request, Missing value on required field `userId`" }
        await next()
        return
    }

    let app = await Store.user.findOne({ key: "AppProfile", appId: query.appId, userId: parseInt(query.userId) })
    if (app) {
        await Store.user.remove({ key: "AppProfile", appId: query.appId, userId: parseInt(query.userId) }, {})
        let appProfile = await Store.user.findOne({ key: "AppProfiles", id: parseInt(query.userId) })
        Log.debug('before: ' + JSON.stringify(appProfile))
        let apps = appProfile.apps.filter(id => id !== query.appId)
        await Store.user.update({ key: "AppProfiles", id: parseInt(query.userId) }, { $set: { apps: apps } }, {})
        appProfile = await Store.user.findOne({ key: "AppProfiles", id: parseInt(query.userId) })
        Log.debug('after: ' + JSON.stringify(appProfile))
        ctx.body = { code: 0, message: "success", appId: query.appId }
        await next()
    }
    else {
        ctx.body = { code: 1, message: "nothing to remove", appId: query.appId }
        await next()
    }
}

let getAppSecret = async (ctx, next) => {
    let query = ctx.request.query
    query = JSON.parse(JSON.stringify(query))

    if (query.appId === undefined || query.appId === "undefined" || query.appId === "null") {
        ctx.body = { status: "failed", message: "Invalid Request, Missing value on required field `appId`" }
        await next()
        return
    }

    if (query.userId === undefined || query.userId === "undefined" || query.userId === "null") {
        ctx.body = { status: "failed", message: "Invalid Request, Missing value on required field `userId`" }
        await next()
        return
    }

    let app = await Store.user.findOne({ key: "AppProfileSecret", appId: query.appId })
    ctx.body = app
    await next()
}

let resetSecret = async (ctx, next) => {
    let query = ctx.request.query
    query = JSON.parse(JSON.stringify(query))

    if (query.appId === undefined || query.appId === "undefined" || query.appId === "null") {
        ctx.body = { status: "failed", message: "Invalid Request, Missing value on required field `appId`" }
        await next()
        return
    }

    if (query.clientId === undefined || query.clientId === "undefined" || query.clientId === "null") {
        ctx.body = { status: "failed", message: "Invalid Request, Missing value on required field `clientId`" }
        await next()
        return
    }

    let clientSecret = Hash.sha256(Date.now() + '').substring(0, 16)
    let appSecret = await Store.user.findOne({ key: "AppProfileSecret", appId: query.appId, clientId: query.clientId })
    if (appSecret) {
        await Store.user.update({ key: "AppProfileSecret", appId: query.appId, clientId: query.clientId }, { $set: { clientSecret: clientSecret } }, {})
        let newSecret = await Store.user.findOne({ key: "AppProfileSecret", appId: query.appId, clientId: query.clientId, clientSecret: clientSecret })
        ctx.body = { code: 0, message: 'success', clientSecret: newSecret.clientSecret }
    }
    else {
        ctx.body = { code: 2, message: 'clientId, clientSecret, or appId invalid' }
    }
}

let getAppBasic = async (ctx, next) => {
    let query = ctx.request.query
    query = JSON.parse(JSON.stringify(query))

    if (query.appId === undefined || query.appId === "undefined" || query.appId === "null") {
        ctx.body = { status: "failed", message: "Invalid Request, Missing value on required field `appId`" }
        await next()
        return
    }

    let app = await Store.user.findOne({ key: "AppProfile", appId: query.appId })
    if (!app) app = await Store.user.findOne({ key: "TeamAppProfile", appId: query.appId })
    ctx.body = app
}

let getAppDetail = async (ctx, next) => {
    let query = ctx.request.query
    query = JSON.parse(JSON.stringify(query))

    if (query.appId === undefined || query.appId === "undefined" || query.appId === "null") {
        ctx.body = { status: "failed", message: "Invalid Request, Missing value on required field `appId`" }
        await next()
        return
    }

    let app = await Store.user.findOne({ key: "AppProfile", appId: query.appId })
    if (!app) app = await Store.user.findOne({ key: "TeamAppProfile", appId: query.appId })

    let instance = await Store.user.findOne({ key: "InstanceProfile", appId: query.appId })
    if (!instance) {
        instance = await Store.user.findOne({ key: "TeamInstanceProfile", appId: query.appId })
        if (instance) app.detail.callback = instance.callback
        await Store.user.remove({ key: "TeamInstanceProfile", appId: query.appId }, {})
    } else {
        if (instance) app.detail.callback = instance.callback
        await Store.user.remove({ key: "InstanceProfile", appId: query.appId }, {})
    }

    ctx.body = app
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

    let app = await Store.user.findOne({ key: "AppProfile", appId: query.appId, userId: parseInt(query.userId) })

    if (!app) {
        await next()
        return
    }

    let ext = app.img.split('.')[1]

    ctx.type = types[ext]
    ctx.body = fs.createReadStream('./data/img/' + app.img)
}

let uploadAppIcon = async (ctx, next) => {
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
    const fileName = Hash.sha256(Date.now() + '').substring(0, 16) + '.' + ext
    const reader = fs.createReadStream(file.image.path);
    const stream = fs.createWriteStream('./data/img/' + fileName)
    reader.pipe(stream)
    Log.trace('uploading ' + file.image.name + ' -> ' + stream.path)

    let isExist = await Store.user.findOne({ key: "AppProfile", appId: ctx.params.id, userId: parseInt(ctx.params.userId) })
    if (!isExist) {
        let appId = Hash.sha256(Date.now() + '').substring(0, 16)
        await Store.user.insert({ key: "AppProfile", appId: appId, userId: parseInt(ctx.params.userId), img: fileName })
        await Store.user.update({ key: "AppProfiles", id: parseInt(ctx.params.userId) }, { $addToSet: { apps: appId } }, {})

        Log.trace("Creating new app, id: " + appId)
        ctx.body = { code: 0, message: "success", img: "/" + fileName, appId: appId }
    }
    else {
        await Store.user.update({ key: "AppProfile", appId: ctx.params.id, userId: parseInt(ctx.params.userId) }, { $set: { img: fileName } }, {})
        await Store.user.update({ key: "AppProfiles", id: parseInt(ctx.params.userId) }, { $addToSet: { apps: ctx.params.id } }, {})

        Log.trace("Updating app, id: " + ctx.params.id)
        ctx.body = { code: 1, message: "success", img: "/" + fileName, appId: ctx.params.id }
    }

    await next
}

let postOauth = async (ctx, next) => {
    let body = ctx.request.body
    Log.debug(body.clientId)
    let appSecret = await Store.user.findOne({ key: "AppProfileSecret", clientId: body.clientId })
    let appId = appSecret.appId
    let app = await Store.user.findOne({ key: "AppProfile", appId: appId })
    if (app) {
        let callback = app.detail.callback
        if (!/https?:\/\//.test(app.detail.callback)) {
            callback = 'https://' + app.detail.callback
        }
        let url = new URL(callback)
        if (body.redirect_uri) {
            let newCallback = body.redirect_uri
            if (!/https?:\/\//.test(body.redirect_uri)) {
                newCallback = 'https://' + body.redirect_uri
            }
            let newUrl = new URL(newCallback)

            if (url.hostname === newUrl.hostname) {
                await Store.user.insert({ key: "InstanceProfile", callback: body.redirect_uri, appId: appId, clientId: body.clientId, clientSecret: appSecret.clientSecret })
                ctx.body = { code: 0, message: "success" }
                await next()
            }
            else {
                ctx.body = { code: 2, message: "Failed with hostname mismatch, redirect to cross site is permitted."}
                await next()
            }
        }
    } else {
        ctx.body = { code: 1, message: "no valid app found" }
        await next()
    }
}

module.exports = {
    app,
    getAppIcon,
    newApp,
    removeApp,
    getAppBasic,
    getAppDetail,
    getAppSecret,
    resetSecret,
    uploadAppIcon,
    postOauth
}

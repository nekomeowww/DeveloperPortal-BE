// Dependencies
const fs = require('fs')
const path = require('path')

// Local Packages
const Log = require('../../util/log')
const Hash = require('../../util/hash')
const Store = require('../../store/store')

let teamApp = async (ctx, next) => {
    let query = ctx.request.query
    query = JSON.parse(JSON.stringify(query))

    if (query.id === undefined || query.id === "undefined" || query.id === "null") {
        ctx.body = { status: "failed", message: "Invalid Request, Missing value on required field `id`" }
        await next()
        return
    }

    let teamApp = await Store.user.findOne({ key: "TeamAppProfiles", id: query.id })
    ctx.body = teamApp
    await next()
}

let newTeamApp = async (ctx, next) => {
    let body = ctx.request.body
    let isExist = await Store.user.findOne({ key: "TeamAppProfile", teamId: body.teamId, appId: body.appId })
    let clientId = []
    let clientSecret = ''
    for (let i = 0; i < 15; i++) {
        clientId.push(Math.floor(Math.random() * Math.floor(9)))
    }
    clientId = clientId.join('')
    clientSecret = Hash.sha256(Date.now() + '').substring(0, 16)

    if (!isExist) {

        const appId = Hash.sha256(Date.now() + '').substring(0, 16)

        await Store.user.insert({ key: "TeamAppProfileSecret", appId: appId, teamId: body.teamId, clientId: clientId, clientSecret: clientSecret})
        await Store.user.insert({ key: "TeamAppProfile", appId: appId, teamId: body.teamId, detail: body.form })
        await Store.user.update({ key: "TeamAppProfiles", id: body.teamId }, { $addToSet: { apps: appId } }, {})

        Log.trace("Creating new team app with information, id: " + appId)
        ctx.body = { code: 0, message: 'success', teamId: body.teamId ,appId: appId, body: body }
    }
    else {

        let app = await Store.user.findOne({ key: "TeamAppProfileSecret", appId: body.appId, teamId: body.teamId })
        if (!app.clientId) {
            await Store.user.insert({ key: "TeamAppProfileSecret", appId: body.appId, teamId: body.teamId, clientId: clientId, clientSecret: clientSecret })
        }

        await Store.user.update({ key: "TeamAppProfile", appId: body.appId, teamId: body.teamId }, { $set: { detail: body.form } }, {})
        await Store.user.update({ key: "TeamAppProfiles", id: body.teamId }, { $addToSet: { apps: body.appId } }, {})

        Log.trace("Updating team app information, id: " + body.appId)
        ctx.body = { code: 1, message: "success", teamId: body.teamId, appId: body.appId, body: body }
    }

    await next()
}

let removeTeamApp = async (ctx, next) => {
    let query = ctx.request.query
    query = JSON.parse(JSON.stringify(query))

    if (query.appId === undefined || query.appId === "undefined" || query.appId === "null") {
        ctx.body = { status: "failed", message: "Invalid Request, Missing value on required field `appId`" }
        await next()
        return
    }

    if (query.teamId === undefined || query.teamId === "undefined" || query.teamId === "null") {
        ctx.body = { status: "failed", message: "Invalid Request, Missing value on required field `teamId`" }
        await next()
        return
    }

    let app = await Store.user.findOne({ key: "TeamAppProfile", appId: query.appId, teamId: query.teamId })
    if (app) {
        await Store.user.remove({ key: "TeamAppProfile", appId: query.appId, teamId: query.teamId }, {})
        let appProfile = await Store.user.findOne({ key: "TeamAppProfiles", id: query.teamId })
        Log.debug('before: ' + JSON.stringify(appProfile))
        let apps = appProfile.apps.filter(id => id !== query.appId)
        await Store.user.update({ key: "TeamAppProfiles", id: query.teamId }, { $set: { apps: apps } }, {})
        appProfile = await Store.user.findOne({ key: "TeamAppProfiles", id: query.teamId })
        Log.debug('after: ' + JSON.stringify(appProfile))        
        ctx.body = { code: 0, message: "success", appId: query.appId }
        await next()
    }
    else {
        ctx.body = { code: 1, message: "nothing to remove", appId: query.appId}
        await next()
    }
}

let getTeamAppSecret = async (ctx, next) => {
    let query = ctx.request.query
    query = JSON.parse(JSON.stringify(query))

    if (query.appId === undefined || query.appId === "undefined" || query.appId === "null") {
        ctx.body = { status: "failed", message: "Invalid Request, Missing value on required field `appId`" }
        await next()
        return
    }

    if (query.teamId === undefined || query.teamId === "undefined" || query.teamId === "null") {
        ctx.body = { status: "failed", message: "Invalid Request, Missing value on required field `teamId`" }
        await next()
        return
    }

    let app = await Store.user.findOne({ key: "TeamAppProfileSecret", appId: query.appId })
    ctx.body = app
    await next()
}

let resetTeamSecret = async (ctx, next) => {
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
    let appSecret = await Store.user.findOne({ key: "TeamAppProfileSecret", appId: query.appId, clientId: query.clientId })
    if (appSecret) {
        await Store.user.update({ key: "TeamAppProfileSecret", appId: query.appId, clientId: query.clientId }, { $set: { clientSecret: clientSecret } }, {})
        let newSecret = await Store.user.findOne({ key: "TeamAppProfileSecret", appId: query.appId, clientId: query.clientId, clientSecret: clientSecret })
        ctx.body = { code: 0, message: 'success', clientSecret: newSecret.clientSecret }
    }
    else {
        ctx.body = { code: 2, message: 'clientId, clientSecret, or appId invalid' }
    }
}

let getTeamAppDetail = async (ctx, next) => {
    let query = ctx.request.query
    query = JSON.parse(JSON.stringify(query))

    if (query.appId === undefined || query.appId === "undefined" || query.appId === "null") {
        ctx.body = { status: "failed", message: "Invalid Request, Missing value on required field `appId`" }
        await next()
        return
    }

    let app = await Store.user.findOne({ key: "TeamAppProfile", appId: query.appId })

    let instance = await Store.user.findOne({ key: "TeamInstanceProfile", appId: query.appId })
    if (instance) app.detail.callback = instance.callback
    await Store.user.remove({ key: "TeamInstanceProfile", appId: query.appId }, {})
    
    ctx.body = app
    await next()
}

let getTeamAppIcon = async (ctx, next) => {
    let query = ctx.request.query
    query = JSON.parse(JSON.stringify(query))

    if (query.appId === undefined || query.appId === "undefined" || query.appId === "null") {
        ctx.body = { status: "failed", message: "Invalid Request, Missing value on required field `appId`" }
        await next()
        return
    }

    if (query.teamId === undefined || query.teamId === "undefined" || query.teamId === "null") {
        ctx.body = { status: "failed", message: "Invalid Request, Missing value on required field `teamId`" }
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

    let app = await Store.user.findOne({ key: "TeamAppProfile", appId: query.appId, teamId: query.teamId })

    if (!app) {
        await next()
        return
    }

    let ext = app.img.split('.')[1]

    ctx.type = types[ext]
    ctx.body = fs.createReadStream('./data/img/' + app.img)
    await next()
}

let uploadTeamAppIcon = async (ctx, next) => {
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

    let isExist = await Store.user.findOne({ key: "TeamAppProfile", appId: ctx.params.appId, teamId: ctx.params.id })
    if (!isExist) {
        let appId = Hash.sha256(Date.now() + '').substring(0, 16)
        await Store.user.insert({ key: "TeamAppProfile", appId: appId, teamId: ctx.params.id, img: fileName })
        await Store.user.update({ key: "TeamAppProfiles", id: ctx.params.id }, { $addToSet: { apps: appId } }, {})

        Log.trace("Creating new team app, id: " + appId)
        ctx.body = { code: 0, message: "success", img: "/" + fileName, appId: appId }
    }
    else {
        await Store.user.update({ key: "TeamAppProfile", appId: ctx.params.appId, teamId: ctx.params.id }, { $set: { img: fileName } }, {})
        await Store.user.update({ key: "TeamAppProfiles", id: ctx.params.id }, { $addToSet: { apps: ctx.params.appId } }, {})

        Log.trace("Updating team app, id: " + ctx.params.id)
        ctx.body = { code: 1, message: "success", img: "/" + fileName, appId: ctx.params.id }
    }

    await next
}

let postOauth = async (ctx, next) => {
    let body = ctx.request.body
    Log.debug(body.clientId)
    let appSecret = await Store.user.findOne({ key: "TeamAppProfileSecret", clientId: body.clientId })
    let appId = appSecret.appId
    let app = await Store.user.findOne({ key: "TeamAppProfile", appId: appId })
    if (app) {
        if (body.redirect_uri) await Store.user.insert({ key: "TeamInstanceProfile", callback: body.redirect_uri, appId: appId, clientId: body.clientId, clientSecret: appSecret.clientSecret })
        ctx.body = { code: 0, message: "success" }
        await next()
    } else {
        ctx.body = { code: 1, message: "no valid app found" }
        await next()
    }
}

module.exports = {
    teamApp,
    getTeamAppIcon,
    newTeamApp,
    removeTeamApp,
    getTeamAppDetail,
    getTeamAppSecret,
    resetTeamSecret,
    uploadTeamAppIcon,
    postOauth
}
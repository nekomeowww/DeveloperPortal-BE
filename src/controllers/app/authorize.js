// Local Packages
const Log = require('../../util/log')
const Store = require('../../store/store')

let postAuthorize = async (ctx, next) => {
    let body = ctx.request.body
    ctx.body = body

    let user = await Store.user.findOne({ key: "PermissionProfile", appId: body.id, userId: parseInt(body.user) })

    if (user) {
        await Store.user.update({ key: "PermissionProfile", appId: body.id, userId: parseInt(body.user) }, { $set: { permission: body.body } }, {})
        Log.trace("Update user permission profile for " + body.user + ", id: " + body.id)
        ctx.body = { code: 1, message: "success" }
        await next()
    }
    else {
        await Store.user.insert({ key: "PermissionProfile", appId: body.id, userId: parseInt(body.user), permission: body })
        Log.trace("Creating new user permission profile for " + body.user + ", id: " + body.id)
        ctx.body = { code: 0, message: "success" }
        await next()
    }
}

let getAuthorize = async (ctx, next) => {
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

    let app = await Store.user.find({ key: "PermissionProfile", appId: query.appId, userId: query.userId })
    ctx.body = app
    await next()
}

module.exports = {
    postAuthorize,
    getAuthorize
}
// Local Packages
const Store = require('../../store/store')

let postPermission = async(ctx, next) => {
    let body = ctx.request.body

    if (body.appId === undefined || body.appId === "undefined" || body.appId === "null") {
        ctx.body = { status: "failed", message: "Invalid Request, Missing value on required field `appId`" }
        await next()
        return
    }

    if (body.userId === undefined || body.userId === "undefined" || body.userId === "null") {
        ctx.body = { status: "failed", message: "Invalid Request, Missing value on required field `userId`" }
        await next()
        return
    }

    let app = await Store.user.findOne({ key: "AppProfile", appId: body.appId, userId: parseInt(body.userId) })
    if (app) {
        await Store.user.update({ key: "AppProfile", appId: body.appId, userId: parseInt(body.userId) }, { $set: { permission: body.permission } }, {})
        ctx.body = { code: 0, message: "success"}
        await next
    }
    else {
        ctx.body = { code: 2, message: "app is invalid" }
        await next
    }
}

let getPermission = async (ctx, next) => {
    let query = ctx.request.query
    query = JSON.parse(JSON.stringify(query))

    if (query.appId === undefined || query.appId === "undefined" || query.appId === "null") {
        ctx.body = { status: "failed", message: "Invalid Request, Missing value on required field `appId`" }
        await next()
        return
    }

    let app = await Store.user.findOne({ key: "AppProfile", appId: query.appId })
    if (app) {
        ctx.body = { code: 0, permission: app.permission }
        await next
    }
    else {
        ctx.body = { code: 2, message: "app is invalid" }
        await next
    }
}

module.exports = {
    postPermission,
    getPermission
}


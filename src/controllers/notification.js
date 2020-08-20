// Local Packages
const Log = require('../util/log')
const Store = require('../store/store')

// notification
let notifyUpdate = async (ctx, next) => {
    let query = ctx.request.query
    query = JSON.parse(JSON.stringify(query))
    ctx.body = "1"
}

let notifyNew = async(ctx, next) => {
    let query = ctx.request.query
    query = JSON.parse(JSON.stringify(query))
    ctx.body = "2"
}

let notifyObject = async(ctx, next) => {
    let query = ctx.request.query
    query = JSON.parse(JSON.stringify(query))
    ctx.body = "3"

}

let notifyPush = async (ctx, next) => {
    let query = ctx.request.query
    query = JSON.parse(JSON.stringify(query))
    
    if (query.id === undefined) {
        ctx.body = { status: "failed", message: "Invalid Request, Missing value on required field `id`" }
        await next()
        return
    }

    let res = await Store.user.findOne({ key: "NotifyProfile", id: parseInt(query.id) })
    ctx.body = res.notifications

    await next()
}

module.exports = {
    notifyUpdate,
    notifyNew,
    notifyObject,
    notifyPush
}
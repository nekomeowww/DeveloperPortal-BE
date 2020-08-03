// Local Packages
const Store = require('../store/store')

let info = async (ctx, next) => {

    let query = ctx.request.query
    query = JSON.parse(JSON.stringify(query))

    if (query.id === undefined || query.id === "undefined" || query.id === "null") {
        ctx.body = { status: "failed", message: "Invalid Request, Missing value on required field `id`" }
        await next()
        return
    }

    let user = await Store.user.findOne({ key: "UserProfile", id: query.id })
    ctx.body = user
    await next()
}

module.exports = info
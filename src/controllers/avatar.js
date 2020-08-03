// Dependencies
const fs = require('fs')

let avatar = async (ctx, next) => {
    let query = ctx.request.query
    query = JSON.parse(JSON.stringify(query))

    if (query.id === undefined || query.id === "undefined" || query.id === "null") {
        ctx.body = { status: "failed", message: "Invalid Request, Missing value on required field `id`" }
        await next()
        return
    }

    ctx.type = 'image/png'
    ctx.body = fs.createReadStream('./data/img/' + query.id + ".png")
    await next()
}

module.exports = avatar
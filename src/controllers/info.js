// Local Packages
const Log = require('../util/log')
const Store = require('../store/store')

let info = async (ctx, next) => {

    let query = ctx.request.query
    query = JSON.parse(JSON.stringify(query))

    if (query.id === undefined || query.id === "undefined" || query.id === "null") {
        ctx.body = { status: "failed", message: "Invalid Request, Missing value on required field `id`" }
        await next()
        return
    }

    let user = await Store.user.findOne({ key: "UserProfile", id: parseInt(query.id) })
    ctx.body = user
    await next()
}

let allUser = async (ctx, next) => {
    let userProfiles = await Store.user.find({ key: "UserProfile" })
    userProfiles.forEach(async user => {
        await Store.user.update({ key: "UserList" }, { $addToSet: { users: user.id } }, {})
    })
    let allusers = await Store.user.findOne({ key: "UserList" })

    let userInfo = []

    for (let i = 0; i < allusers.users.length; i++) {
        Store.user.findOne({ key: "UserProfile", id: parseInt(allusers.users[i]) }).then(res => {
            userInfo.push(res)
        })
    }
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve()
            ctx.body = { code: 0, users: userInfo, message: 'success' }
            return next()
        }, 4000)
    })
}
module.exports = {
    info,
    allUser
}


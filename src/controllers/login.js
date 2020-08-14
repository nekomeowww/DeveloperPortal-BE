// Local Package
let Log = require('../util/log')
let Store = require('../store/store')

const login = async (ctx, next) => {
    let query = ctx.request.query
    query = JSON.parse(JSON.stringify(query))
    // Error Handling
    if (query.id === undefined) {
        ctx.status = 406
        ctx.body = { message: "Invalid Request, Missing value on required field `id`" }
        await next()
        return
    }
    if (query.email === undefined) {
        ctx.status = 406
        ctx.body = { message: "Invalid Request, Missing value on required field `email`" }
        await next()
        return
    }
    if (query.nickname === undefined) {
        ctx.status = 406
        ctx.body = { message: "Invalid Request, Missing value on required field `nickname`" }
        await next()
        return
    }
    if (query.avatar === undefined) {
        ctx.status = 406
        ctx.body = { message: "Invalid Request, Missing value on required field `avatar`" }
        await next()
        return
    }

    // Login User Data
    let isFirst = await Store.user.isFirst(parseInt(query.id))
    if (isFirst) {
        await Store.user.update({ key: "UserList" }, { $addToSet: { users: parseInt(query.id) } }, {})
        await Store.user.insert({ key: "UserProfile", id: parseInt(query.id), email: query.email, nickname: query.nickname, avatar: query.avatar })
        await Store.user.insert({ key: "AppProfiles", id: parseInt(query.id), apps: [] })
        await Store.user.insert({ key: "VaultProfiles", id: parseInt(query.id), vaults: [] })
        Log.debug("New user " + query.nickname + " logged in, user data written into database.")
        ctx.body = { message: "Welcome! New user " + query.nickname }
    }
    else {
        let hasVaultProfiles = await Store.user.findOne({ key: "VaultProfiles", id: parseInt(query.id) })
        if (!hasVaultProfiles) {
            Log.info("Breaking change happened at this version, creating database for user")
            await Store.user.insert({ key: "VaultProfiles", id: parseInt(query.id), vaults: [] })
        }
        ctx.body = { message: "Welcome back! " + query.nickname }
        Log.debug('Existing user ' + query.nickname + ' logged in.')
    }
    await next()
}

module.exports = login
// Local Packages
const Log = require('../util/log')
const Store = require('../store/store')
const Hash = require('../util/hash')

// /invite endpoint
let invite = async (ctx, next) => {
    let query = ctx.request.query
    query = JSON.parse(JSON.stringify(query))

    if (query.id === undefined) {
        ctx.body = { status: "failed", message: "Invalid Request, Missing value on required field `id`" }
        await next()
        return
    }
    if (query.inviteId === undefined) {
        ctx.body = { status: "failed", message: "Invalid Request, Missing value on required field `inviteId`" }
        await next()
        return
    }

    if (query.teamId === undefined) {
        ctx.body = { status: "failed", message: "Invalid Request, Missing value on required field `teamId`" }
        await next()
        return
    }

    let src = await Store.user.findOne({ key: "UserProfile", id: parseInt(query.id) })
    let user = await Store.user.findOne({ key: "UserProfile", id: parseInt(query.inviteId) })
    let team = await Store.user.findOne({ key: "TeamProfile", teamId: query.teamId })
    if (user === null) {
        ctx.body = { status: 'failed', message: 'No sepecified user found' }
        await next()
        return
    }
    let res = await Store.user.findOne({ key: "NotifyProfile", id: user.id })
    let notifyId = res.notifications.length + 1 || 0
    let notifyObject = {
        notifyGlobalId: Hash.sha256(notifyId + "").substring(0,8),
        notifyId: notifyId,
        userId: src.id,
        title: src.nickname,
        body: src.nickname + "邀请你加入 " + team.detail.name,
        proceed: false
    }

    await Store.main.insert({ key: "Notify" }, { $push: notifyObject })
    await Store.user.update({ key: "NotifyProfile", id: user.id }, { $push: { notifications: notifyObject } }, {})

    ctx.body = notifyObject
    await next()
}

let inviteUpdate = async (ctx, next) => {
    let query = ctx.request.query
    query = JSON.parse(JSON.stringify(query))
    ctx.body = query

    if (query.id === undefined) {
        ctx.body = { status: "failed", message: "Invalid Request, Missing value on required field `id`" }
        await next()
        return
    }
    if (query.result === undefined) {
        ctx.body = { status: "failed", message: "Invalid Request, Missing value on required field `result`" }
        await next()
        return
    }
    if (query.notifyId === undefined) {
        ctx.body = { status: "failed", message: "Invalid Request, Missing value on required field `notifyId`" }
        await next()
        return
    }
    if (query.inviteId === undefined) {
        ctx.body = { status: "failed", message: "Invalid Request, Missing value on required field `inviteId`" }
        await next()
        return
    }
    if (query.teamId === undefined) {
        ctx.body = { status: "failed", message: "Invalid Request, Missing value on required field `teamId`" }
        await next()
        return
    }

    switch(query.result) {
        case "accept":
            accept(query)
        case "deny":
            deny(query)
    }

    ctx.body = { message: "success" }
}

async function accept(query) {
    await Store.user.update({ key: "TeamProfile", teamId: query.teamId }, { $addToSet: { users: parseInt(query.inviteId) } }, {})
    let res = await Store.user.findOne({ key: "NotifyProfile", id: parseInt(query.id) })
    let notifications = res.notifications.filter(e => e.notifyId !== parseInt(query.notifyId))
    await Store.user.update({ key: "NotifyProfile", id: query.id }, { $set: { notifications: notifications }}, {})
}

async function deny(query) {
    let res = await Store.user.findOne({ key: "NotifyProfile", id: parseInt(query.id) })
    let notifications = res.notifications.filter(e => e.notifyId !== parseInt(query.notifyId))
    await Store.user.update({ key: "NotifyProfile", id: parseInt(query.id) }, { $set: { notifications: notifications }}, {})
}

module.exports = {
    invite,
    inviteUpdate
}
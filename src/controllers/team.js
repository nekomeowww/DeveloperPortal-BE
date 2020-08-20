// Dependencies
const fs = require('fs')
const path = require('path')

// Local Packages
const Log = require('../util/log')
const Hash = require('../util/hash')
const Store = require('../store/store')

let team = async (ctx, next) => {
    let query = ctx.request.query
    query = JSON.parse(JSON.stringify(query))

    if (query.id === undefined || query.id === "undefined" || query.id === "null") {
        ctx.body = { status: "failed", message: "Invalid Request, Missing value on required field `id`" }
        await next()
        return
    }

    let teams = await Store.user.findOne({ key: "TeamProfiles", id: parseInt(query.id) })
    ctx.body = teams
    await next()
}

let newTeam = async (ctx, next) => {
    let body = ctx.request.body

    let isExist = await Store.user.findOne({ key: "TeamProfile", teamId: body.teamId, userId: parseInt(body.userId) })
    if (!isExist) {

        const teamId = Hash.sha256(Date.now() + '').substring(0, 16)

        await Store.user.insert({ key: "TeamProfile", teamId: teamId, userId: parseInt(body.userId), detail: body.form, admins: [], users: [] })
        await Store.user.insert({ key: "TeamAppProfiles", id: teamId, apps: [], users: [], admins: [] })
        await Store.user.update({ key: "TeamProfiles", id: parseInt(body.userId) }, { $addToSet: { teams: teamId } }, {})

        Log.trace("Creating new team with information, id: " + teamId)
        ctx.body = { code: 0, message: 'success', teamId: teamId, body: body }
    }
    else {

        await Store.user.update({ key: "TeamProfile", teamId: body.teamId, userId: parseInt(body.userId) }, { $set: { detail: body.form } }, {})
        await Store.user.update({ key: "TeamProfiles", id: parseInt(body.userId) }, { $addToSet: { teams: body.teamId } }, {})

        Log.trace("Updating team information, id: " + body.teamId)
        ctx.body = { code: 1, message: "success", teamId: body.teamId, body: body }
    }

    await next()
}

let removeTeam = async (ctx, next) => {
    let query = ctx.request.query
    query = JSON.parse(JSON.stringify(query))

    if (query.teamId === undefined || query.teamId === "undefined" || query.teamId === "null") {
        ctx.body = { status: "failed", message: "Invalid Request, Missing value on required field `teamId`" }
        await next()
        return
    }

    if (query.userId === undefined || query.userId === "undefined" || query.userId === "null") {
        ctx.body = { status: "failed", message: "Invalid Request, Missing value on required field `userId`" }
        await next()
        return
    }

    let team = await Store.user.findOne({ key: "TeamProfile", teamId: query.teamId, userId: parseInt(query.userId) })
    if (team) {
        await Store.user.remove({ key: "TeamProfile", teamId: query.teamId, userId: parseInt(query.userId) }, {})
        let teamProfile = await Store.user.findOne({ key: "TeamProfiles", id: parseInt(query.userId) })
        Log.debug('before: ' + JSON.stringify(teamProfile))
        let teams = teamProfile.teams.filter(id => id !== query.teamId)
        await Store.user.update({ key: "TeamProfiles", id: parseInt(query.userId) }, { $set: { teams: teams } }, {})
        teamProfile = await Store.user.findOne({ key: "TeamProfiles", id: parseInt(query.userId) })
        Log.debug('after: ' + JSON.stringify(teamProfile))        
        ctx.body = { code: 0, message: "success", teamId: query.teamId }
        await next()
    }
    else {
        ctx.body = { code: 1, message: "nothing to remove", teamId: query.teamId}
        await next()
    }
}

let getTeamDetail = async (ctx, next) => {
    let query = ctx.request.query
    query = JSON.parse(JSON.stringify(query))

    if (query.teamId === undefined || query.teamId === "undefined" || query.teamId === "null") {
        ctx.body = { status: "failed", message: "Invalid Request, Missing value on required field `teamId`" }
        await next()
        return
    }

    let team = await Store.user.findOne({ key: "TeamProfile", teamId: query.teamId })
    ctx.body = team
    await next()
}

let getTeamIcon = async (ctx, next) => {
    let query = ctx.request.query
    query = JSON.parse(JSON.stringify(query))

    if (query.userId === undefined || query.userId === "undefined" || query.userId === "null") {
        ctx.body = { status: "failed", message: "Invalid Request, Missing value on required field `userId`" }
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

    let team = await Store.user.findOne({ key: "TeamProfile", teamId: query.teamId, userId: parseInt(query.userId) })

    if (!team) {
        await next()
        return
    }

    let ext = team.img.split('.')[1]

    ctx.type = types[ext]
    ctx.body = fs.createReadStream('./data/img/' + team.img)
    await next()
}

let uploadTeamIcon = async (ctx, next) => {
    console.log('on team upload')
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

    let isExist = await Store.user.findOne({ key: "TeamProfile", teamId: ctx.params.id, userId: parseInt(ctx.params.userId) })
    if (!isExist) {
        let teamId = Hash.sha256(Date.now() + '').substring(0, 16)
        await Store.user.insert({ key: "TeamProfile", teamId: teamId, userId: parseInt(ctx.params.userId), img: fileName, admins: [], users: [] })
        await Store.user.insert({ key: "TeamAppProfiles", id: teamId, apps: [], users: [], admins: [] })
        await Store.user.update({ key: "TeamProfiles", id: parseInt(ctx.params.userId) }, { $addToSet: { teams: teamId } }, {})

        Log.trace("Creating new team, id: " + teamId)
        ctx.body = { code: 0, message: "success", img: "/" + fileName, teamId: teamId }
    }
    else {
        await Store.user.update({ key: "TeamProfile", teamId: ctx.params.id, userId: parseInt(ctx.params.userId) }, { $set: { img: fileName } }, {})
        await Store.user.update({ key: "TeamProfiles", id: parseInt(ctx.params.userId) }, { $addToSet: { teams: ctx.params.id } }, {})

        Log.trace("Updating team, id: " + ctx.params.id)
        ctx.body = { code: 1, message: "success", img: "/" + fileName, teamId: ctx.params.id }
    }

    await next
}

module.exports = {
    team,
    newTeam,
    removeTeam,
    getTeamDetail,
    getTeamIcon,
    uploadTeamIcon
}
// Local Packages
const Log = require('../../util/log')
const Hash = require('../../util/hash')
const Store = require('../../store/store')

let addVault = async (ctx, next) => {
    let body = ctx.request.body

    let appSecret = await Store.user.findOne({ key: "AppProfileSecret", appId: body.appId })

    const id = Hash.sha256(Date.now() + '').substring(0, 16)

    let vault = await Store.user.findOne({ key: "Vault", appId: body.appId, name: body.form.name })
    if (vault) {
        ctx.body = { code: 1, message: 'vault already exist' }
        await next()
        return
    }
    else {
        await Store.user.insert({ key: "Vault", id: id, name: body.form.name, value: body.form.value, appId: body.appId, userId: parseInt(body.userId), clientId: appSecret.clientId, clientSecret: appSecret.clientSecret })
        vault = await Store.user.findOne({ key: "Vault", appId: body.appId })
        if (!vault) {
            ctx.body = { code: 2, message: 'failed to store vault' }
            await next()
            return
        }
    }

    await Store.user.update({ key: "VaultProfiles", id: parseInt(body.userId) }, { $addToSet: { vaults: id } }, {})
    let vaults = await Store.user.findOne({ key: "VaultProfiles", id: parseInt(body.userId) })
    if (!vaults) {
        ctx.body = { code: 3, message: 'failed to store vault in user profile' }
        await next()
        return
    }

    ctx.body = { code: 0, message: 'success' }
}

let removeVault = async (ctx, next) => {
    let query = ctx.request.query
    query = JSON.parse(JSON.stringify(query))

    let vault = await Store.user.findOne({ key: "Vault", id: query.id, appId: query.appId, userId: parseInt(query.userId) })
    let vaults = await Store.user.findOne({ key: "VaultProfiles", id: parseInt(query.userId) })
    if (vault && vaults.vaults.length !== 0) {
        await Store.user.remove({ key: "Vault", id: query.id, appId: query.appId, userId: parseInt(query.userId) }, {})
        let newVault = vaults.vaults.filter(id => id !== query.id)
        await Store.user.update({ key: "VaultProfiles", id: parseInt(query.userId) }, { $set: { vaults: newVault } }, {})
        ctx.body = { code: 0, message: 'success' }
        await next()
    }
    else {
        ctx.body = { code: 2, message: 'vault is invalid or database dubplicated' }
        await next()
    }
}

let updateVault = async (ctx, next) => {
    let body = ctx.request.body

    let vault = await Store.user.findOne({ key: "Vault", id: body.vaultId, appId: body.appId, userId: parseInt(body.userId) })
    if (vault) {
        await Store.user.update({ key: "Vault", id: body.vaultId, appId: body.appId, userId: parseInt(body.userId) }, { $set: { name: body.form.name } }, {})
        await Store.user.update({ key: "Vault", id: body.vaultId, appId: body.appId, userId: parseInt(body.userId) }, { $set: { value: body.form.value } }, {})
        ctx.body = { code: 0, message: 'success' }
        await next()
    } else {
        ctx.body = { code: 2, message: 'vault is invalid, it appears to be not exist' }
        await next()
    }
}

let getVaultList = async (ctx, next) => {
    let query = ctx.request.query
    query = JSON.parse(JSON.stringify(query))

    let vaults = await Store.user.findOne({ key: "VaultProfiles", id: parseInt(query.userId) })
    ctx.body = vaults
}

let getVault = async (ctx, next) => {
    let query = ctx.request.query
    query = JSON.parse(JSON.stringify(query))

    let vault = await Store.user.findOne({ key: "Vault", id: query.id, appId: query.appId, userId: parseInt(query.userId) })
    ctx.body = vault
    await next()
}

module.exports = {
    addVault,
    removeVault,
    updateVault,
    getVaultList,
    getVault
}
// Dependencies
const KoaRouter = require('koa-router')

// Local Package
const { app, newApp, removeApp, getAppDetail, getAppIcon, getAppSecret, postOauth } = require('../controllers/app')
const { getPermission, postPermission } = require('../controllers/app/permission')
const { getAuthorize, postAuthorize } = require('../controllers/app/authorize')
const { addVault, removeVault, getVaultList, getVault, updateVault } = require('../controllers/app/vault')

const AppRouter = new KoaRouter()

// Get App List
AppRouter.get("/", app)
// Post oauth parameters
AppRouter.post("/oauth", postOauth)
// Authorize related
AppRouter.post("/authorize", postAuthorize)
AppRouter.get("/authorize", getAuthorize)
// Permission control related
AppRouter.post("/permission", postPermission)
AppRouter.get("/permission", getPermission)
// Info get related
AppRouter.get("/detail", getAppDetail)
AppRouter.get("/secret", getAppSecret)
// App Creation and deletion
AppRouter.post("/new", newApp)
AppRouter.get("/remove", removeApp)
// App Icon Control
AppRouter.get("/appIcon", getAppIcon)
// Vault Creation and deletion
AppRouter.post("/addvault", addVault)
AppRouter.get("/removevault", removeVault)
// Vault Info get related
AppRouter.get("/vaultlist", getVaultList)
AppRouter.get("/vault", getVault)
// Update Vault
AppRouter.post("/updatevault", updateVault)


module.exports = AppRouter
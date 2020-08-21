// Dependencies
const KoaRouter = require('koa-router')

// Local Package
const { team, newTeam, removeTeam, getTeamIcon, getTeamDetail, quitTeam } = require('../controllers/team')
const { newTeamApp, getTeamAppSecret, removeTeamApp, getTeamAppIcon, resetTeamSecret, teamApp, getTeamAppDetail } = require('../controllers/team/app')

const TeamRouter = new KoaRouter()

TeamRouter.get("/", team)
// Team detail related
TeamRouter.get("/detail", getTeamDetail)
// Team creation and deletion
TeamRouter.post("/new", newTeam)
TeamRouter.get("/remove", removeTeam)
// Team Icon Control
TeamRouter.get("/teamIcon", getTeamIcon)
// Team Application Related
TeamRouter.get("/app", teamApp)
TeamRouter.get("/appdetail", getTeamAppDetail)
TeamRouter.get("/secret", getTeamAppSecret)
TeamRouter.get("/resetsecret", resetTeamSecret)
// Team Creation and deletion
TeamRouter.post("/newapp", newTeamApp)
TeamRouter.get("/removeapp", removeTeamApp)
// Team Icon Control
TeamRouter.get("/appIcon", getTeamAppIcon)
TeamRouter.get("/quit", quitTeam)

module.exports = TeamRouter
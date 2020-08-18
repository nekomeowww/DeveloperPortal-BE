// Dependencies
const KoaRouter = require('koa-router')

// Local Package
const { team, newTeam, removeTeam, getTeamIcon, getTeamDetail } = require('../controllers/team')

const TeamRouter = new KoaRouter()

TeamRouter.get("/", team)
// Team detail related
TeamRouter.get("/detail", getTeamDetail)
// Team creation and deletion
TeamRouter.post("/new", newTeam)
TeamRouter.get("/remove", removeTeam)
// Team Icon Control
TeamRouter.get("/teamIcon", getTeamIcon)

module.exports = TeamRouter
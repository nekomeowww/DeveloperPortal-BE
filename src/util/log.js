// Dependencies
const log4js = require("log4js")

let SysTime = new Date()
let logTime = SysTime.getFullYear() + "-" + ("0" + (SysTime.getMonth() + 1)).slice(-2) + "-" + ("0" + SysTime.getDate()).slice(-2)
const coreLogFileName = `./logs/DeveloperPortalBE-${logTime}.log`

log4js.configure({
    appenders: {
        Core: { type: "file", filename: coreLogFileName },
        console: { type: "console" }
    },
    categories: {
        DeveloperPortalBE: { appenders: ["console", "Core"], level: "trace" },
        default: { appenders: ["console"], level: "trace" }
    }
})

let DeveloperPortalBELogger = log4js.getLogger("DeveloperPortalBE")

function info(log) {
    DeveloperPortalBELogger.info(log)
}

function trace(log) {
    DeveloperPortalBELogger.trace(log)
}

function debug(log) {
    DeveloperPortalBELogger.debug(log)
}

function warning(log) {
    DeveloperPortalBELogger.warn(log)
}

function fatal(log) {
    DeveloperPortalBELogger.fatal(log)
}

function level(lev) {
    DeveloperPortalBELogger.level = lev
}

module.exports = {
    info,
    trace,
    debug,
    warning,
    fatal,
    level
}
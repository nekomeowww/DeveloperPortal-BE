// Dependencies
const fs = require('fs')
const { exitCode } = require('process')

let getImg = async (ctx, next) => {
    let query = ctx.params
    query = JSON.parse(JSON.stringify(query))

    const ext = ctx.params.imgName.split('.')[1]

    const types = {
        png: 'image/png',
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        gif: 'image/gif',
        webp: 'image/webp',
    }

    ctx.type = types[ext]
    ctx.body = fs.createReadStream('./data/img/' + ctx.params.imgName)
    await next()
}

module.exports = getImg
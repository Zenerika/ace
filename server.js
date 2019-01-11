const express = require('express')
const knexLib = require('knex')
const fs = require('fs-plus')
const app = express()

app.use(express.static('Public'))

app.listen(process.env.PORT || 3000, () => {
    console.log('Listening on port 3000.')
})


// const defaultDbOptions = {
//     client: 'sqlite3',
//     connection: {
//         filename : 'database.db'
//     }
// }

// let dbOptions = defaultDbOptions
// try {
//     dbOptions = JSON.parse(fs.readFileSync('./config.json'))
// } catch (e) {}

// console.log('the dbOptions:', dbOptions)

// var knex = knexLib(dbOptions)

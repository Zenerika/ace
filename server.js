/* Express */

const express = require('express')
const knexLib = require('knex')
const fs = require('fs-plus')
const app = express()

app.use(express.static('Public'))

app.get('/', function (req, res) {
  res.sendFile('login.html', { root : __dirname })
})

/* Express Validator */

const { body,validationResult } = require('express-validator/check')
const { sanitizeBody } = require('express-validator/filter')

/* Passport Setup */

const passport = require('passport')
app.use(passport.initialize())
app.use(passport.session())

app.get('/success', function (req, res) {
  res.send("You have successfully logged in")
})
app.get('/error', function (req, res) {
  res.send("Error logging in")
})

passport.serializeUser(function (user, cb) {
  cb(null, user.id)
})
passport.deserializeUser(function (id, cb) {
  db.users.findById(id, function (err, user) {
    if (err) { return cb(err) }
    cb(null, user)
  })
})

/* Local Auth */

// figure out db (database user id searching) //

const Strategy = require('passport-local').Strategy

passport.use(new Strategy(
  function(username, password, cb) {
    db.users.findByUsername(username, function(err, user) {
      if (err) { return cb(err) }
      if (!user) { return cb(null, false) }
      if (user.password != password) { return cb(null, false) }
      return cb(null, user)
    })
  }))

/* Facebook Auth */

const FacebookStrategy = require('passport-facebook').Strategy

const FACEBOOK_APP_ID = '1972214219741500'
const FACEBOOK_APP_SECRET = '52caefe50fa829ae902d8c69c60617dd'

passport.use(new FacebookStrategy({
  clientID: FACEBOOK_APP_ID,
  clientSecret: FACEBOOK_APP_SECRET,
  callbackURL: "/auth/facebook/callback"
},
function (accessToken, refreshToken, profile, cb) {
  return cb(null, profile)
}
))

app.get('/auth/facebook',
  passport.authenticate('facebook'));

app.get('/auth/facebook/callback',
  passport.authenticate('facebook', {failureRedirect: '/error'}),
  function(req, res) {
    res.redirect('/success')
})

app.listen(process.env.PORT || 3000, () => {
    console.log('Listening on port 3000.')
})
<<<<<<< HEAD


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
=======
>>>>>>> updates to website form

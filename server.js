/* Express */

const express = require('express')
const exphbs = require('express-handlebars')
//const fs = require('fs-plus')
const app = express()
var bodyParser = require('body-parser')
// const cookieSession = require('cookie-session')
const session = require('express-session')
const db = require('./models')
const passport = require('passport')


app.use(express.static('Public'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))
app.engine('handlebars', exphbs({defaultLayout: 'main'}))
app.set('view engine', 'handlebars')

/* Local Auth */

const LocalStrategy = require('passport-local').Strategy

app.use(session({
  secret: 'randomstring',
  resave: false,
  saveUninitialized: true,
  expires: false
}))

app.use(passport.initialize())
app.use(passport.session())

passport.serializeUser(function(user, cb) {
  console.log('user: ', user)
  cb(null, user.id)
})

passport.deserializeUser(function(id, cb) {
  console.log('userdeserialze: ', id)
  db.User.findOne({ where: {id: id} })
    .then((user) => {
      cb(null, user)
    })
    .catch((err) => {
      console.log('error: ', err)
      cb(null, false)
    })

})

passport.use(new LocalStrategy({
        // this maps the file names in the html file to the passport stuff
        usernameField: 'emailLogin',
        passwordField: 'passwordLogin'
    },
    function (email, password, done) {
        return db.User.findOne({ where: {email: email} })
          .then((user) => {

            if (!user) {
                console.log('bad email')
                return done(null, false, {message: 'Incorrect email.'});
            } else {
                if (user.password === password) {
                    console.log('good email and password');
                    return done(null, user.dataValues);
                } else {
                    console.log('good email and bad password');
                    return done(null, false, {message: 'Incorrect password.'});
                }
            }
          })
          .catch((err) => {
            return done(err, false)
          })

    }
))

app.get('/', function (req, res) {
  console.log('req.user ', req.user)
  res.render('home', {user: req.user})
})


app.get('/login', function (req, res) {
  res.render('login')
})

app.get('/signup', function (req, res) {
  res.render('signup')
})

/* Express Validator */

const { body,validationResult } = require('express-validator/check')
const { sanitizeBody } = require('express-validator/filter')

/* cookieSession config */


// app.use(cookieSession({
//     name: 'session',
//     maxAge: 24 * 60 * 60 * 1000, //one day in milliseconds
//     keys: ['randomstringhere']
// }))

/* Passport Setup */


app.get('/success', function (req, res) {
  res.send("You have successfully logged in")
})
app.get('/error', function (req, res) {
  res.send("Error logging in")
})



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

/* HTTP Methods */

app.post('/login', passport.authenticate('local'), function (req, res, next) {
    console.log('req.session: ', req.session, req.user)
      if (req.user) {
          res.render('home', {user: req.user})
      } else {
          res.render('login', {error: err, info: info});
      }
});

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

app.post('/signup', function (req, res, next) {
    //verify all fields are filled
    if (!req.body.firstNameSignup || !req.body.lastNameSignup
    || !req.body.emailSignup || !req.body.passwordSignup
    || !req.body.confirmPasswordSignup) {
      console.log('Missing field(s).')
      res.render('signup', {validate: 'Missing field(s).'})
    }
    //verify password greater than 6 characters
    else if (req.body.passwordSignup.length <= 6) {
      console.log('Password must be longer than 6 characters.')
      res.render('signup', {validate: 'Password must be longer than 6 characters.'})
    }
    //verify password matches confirm password
    else if (req.body.passwordSignup !== req.body.confirmPasswordSignup) {
      console.log('Passwords must match.')
      res.render('signup', {validate: 'Passwords must match.'})
    }
    //verify email is not already in use
    else {
      var email = req.body.emailSignup
      db.User.findOne({ where: {email: email} })
        .then((user) => {
          console.log(user)
          if (user !== null) {
            console.log('Email is already in use.')
            res.render('signup', {validate: user.dataValues.email + ' is already in use.'})
          } else {
              db.User.create({
                email: req.body.emailSignup,
                password: req.body.passwordSignup,
                first_name: req.body.firstNameSignup,
                last_name: req.body.lastNameSignup
              })
              .then((user) => {
                console.log('user: ', user)
                res.render('login', {signup: 'Your account has been created. Please login.'})
              })
              .catch((err) => {
                console.log('error: ', err)
              })
          }
        })
        .catch((err) => {
          console.log('error :', err)
        })
    }

})

app.get('/auth/facebook',
  passport.authenticate('facebook'));

app.get('/auth/facebook/callback',
  passport.authenticate('facebook', {failureRedirect: '/error'}),
  function(req, res) {
    res.redirect('/success')
})

const api = require('./routes/routes.js')
app.use('/api', api)

app.listen(process.env.PORT || 3000, () => {
    console.log('Listening on port 3000.')
})

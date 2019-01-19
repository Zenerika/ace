/* Express */

const express = require('express')
const exphbs = require('express-handlebars')
//const fs = require('fs-plus')
const app = express()
var bodyParser = require('body-parser')
// const cookieSession = require('cookie-session')
const session = require('express-session')
const db = require('./models')
const queryFile = require('./routes/queries/query.js')
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
  saveUninitialized: true
}))

app.use(passport.initialize())
app.use(passport.session())

passport.serializeUser(function(user, cb) {
  console.log('user: ', user)
  cb(null, user.id)
})

passport.deserializeUser(function(id, cb) {
  console.log('userdeserialze: ', id)
  db.User.findOne({
     where: {id: id},
     include: [{
      model: db.Dog,
      // where: { state: Sequelize.col('project.state') }
  }]
     })
    .then((user) => {
      var adoptedDogs = user.Dogs.map(dog => dog.dataValues)
      console.log(adoptedDogs)
      user = user.dataValues
      user.cart = adoptedDogs
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
  if (req.user) {
    queryFile.findCart(req.user.id)
    .then ((user) => {
      console.log(user)
      var adoptedDogs = user.Dogs.map(dog => dog.dataValues)
      console.log(adoptedDogs)
      req.user.cart = adoptedDogs
      console.log(req.user.cart)
      res.render('home', {user:req.user, adoptData: adoptedDogs})
    })
    .catch ((err) => {
      console.log('Error:', err)
    })
  }
  else {
    res.render('home', {user: req.user})
  }
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

          res.redirect('/');
      } else {
          res.render('login', {error: err, info: info});
      }
});

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

app.post('/signup', function (req, res, next) {
  console.log('req.body: ', req.body)
    //verify all fields are filled
    if (!req.body.firstNameSignup || !req.body.lastNameSignup
    || !req.body.emailSignup || !req.body.passwordSignup
    || !req.body.confirmPasswordSignup) {
      console.log('missing field')
      res.render('/signup', )
    }
    // //verify email is not already in use
    // else if (req.body.emailSignup) {
    //  console.log('email is already in use')
    //
    // }
    // //verify valid email format
    // else if () {
    //  console.log('invalid email format')
    //
    // }
    // //verify password greater than 6 characters
    // else if (req.body.passwordSignup <= 6) {
    //  console.log('password less than 7 characters')
    //
    // }
    // //verify password matches confirm password
    // else if (req.body.passwordSignup !== req.body.confirmPasswordSignup) {
    //  console.log('password does not match confirm password')
    //
    // } else {
    //   db.User.create({
    //     email: req.body.emailSignup,
    //     password: req.body.passwordSignup,
    //     first_name: req.body.firstNameSignup,
    //     last_name: req.body.lastNameSignup
    //   })
    //   .then((user) => {
    //     console.log('user: ', user)
    //   })
    //   .catch((err) => {
    //     console.log('error: ', err)
    //   })
    // }



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

/* Express */

const express = require('express')
const exphbs = require('express-handlebars')
//const fs = require('fs-plus')
const app = express()
var bodyParser = require('body-parser')
const session = require('express-session')
const db = require('./models')
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const GoogleStrategy = require('passport-google-oauth20').Strategy;

/* Passport Setup - Order Important*/

app.use(express.static('Public'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))
app.engine('handlebars', exphbs({defaultLayout: 'main'}))
app.set('view engine', 'handlebars')

app.use(session({
  secret: 'randomstring',
  resave: false,
  saveUninitialized: true,
  expires: false
}))

app.use(passport.initialize())
app.use(passport.session())

passport.serializeUser(function(user, cb) {
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

      var total = 0;

      adoptedDogs.forEach(function (dog){
        total += dog.adoption_fee
      })
      console.log("Total:", total)

      user = user.dataValues
      user.cartTotal = total
      user.cart = adoptedDogs
      cb(null, user)
    })
    .catch((err) => {
      console.log('error: ', err)
      cb(null, false)
    })

})

// cart middleware
app.use(function (req, res, nextFn) {
  // user is logged in; add their cart to the user object
  if (req.user) {
    // TODO: add cart here; attach to req.user
  }
  nextFn()
})

/* Local Auth */

passport.use(new LocalStrategy({
        // this maps the file names in the html file to the passport stuff
        usernameField: 'emailLogin',
        passwordField: 'passwordLogin'
    },
    function (email, password, done) {
        return db.User.findOne({ where: {email: email} })
          .then((user) => {

            if (!user) {
                console.log('bad email');
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

/* Google Auth */

const GOOGLE_CLIENT_ID = '484414699212-buau7mv01v6262bovdf01qh71lig07cv.apps.googleusercontent.com'
const GOOGLE_CLIENT_SECRET = 'P6dxEfXe-wWh4IenJcUmH0Xn'

passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback"
  },
  function(token, refreshToken, profile, cb) {
    console.log('profile: ', profile)

    db.User.findOne({ where: {email: profile.emails[0].value} })
      .then((user) => {
        console.log('good google id')
        console.log('user: ', user)
        return cb(null, user.dataValues);
      })
      .catch((err) => {
        console.log('google id not found - signing up')
        db.User.create({
          email: profile.emails[0].value,
          first_name: profile.name.givenName,
          last_name: profile.name.familyName,
          google_id: profile.id
        })
        .then((user) => {
          console.log('user: ', user)
          return cb(null, user.dataValues);
        })
        .catch((err) => {
          console.log('error: ', err)
        })
      })
}))

/* HTTP Methods */

app.get('/', function (req, res) {
  let cart = null
  if (req.user && req.user.cart) {
    cart = req.user.cart
  }

  res.render('home', {
    user: req.user,
    adoptData: cart
  })
})

app.get('/login', function (req, res) {
  res.render('login')
})

app.get('/signup', function (req, res) {
  res.render('signup')
})

app.post('/login', passport.authenticate('local'), function (req, res, next) {
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

app.get('/auth/google',
  passport.authenticate('google', { scope:
      [ 'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email' ] }
));

app.get('/auth/google/callback',
  passport.authenticate('google', {failureRedirect: '/login'}),
  function(req, res) {
    console.log('req.user: ', req.user)
    res.render('home', {user: req.user})
})

const api = require('./routes/routes.js')
app.use('/api', api)

app.listen(process.env.PORT || 3000, () => {
    console.log('Listening on port 3000.')
})

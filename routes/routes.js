const express = require("express")
const router = express.Router()
const query = require('./queries/query.js')
const Sequelize = require('sequelize');
const Op = Sequelize.Op
const db = require('../models')

// Search By Panel
router.get('/dogs', (req,res) => {
    // req = requested data from front end
    // res = retrieve data from database
    console.log(req.query)

    let gender;

    if ((req.query.male && req.query.female) || (!req.query.male && !req.query.female)) {
        gender ={
            [Op.or]: ["M", "F"]
        }
    }
    else if (req.query.male) {
        gender = "M"
    }
    else if (req.query.female) {
        gender = "F"
    }


    let price = {}

    if (req.query.price === '<$100') {
        price = {
            [Op.lt]: 100
        }
    }
    else if (req.query.price === '$100-$250') {
        price = {
            [Op.and]: [{
                [Op.gte]: 100
            }, {
                [Op.lt]: 250
            }]
        }
    }
    else if (req.query.price === '$250-$500') {
        price = {
            [Op.and]: [{
                [Op.gte]: 250
            }, {
                [Op.lt]: 500
            }]
        }
    }
    else if (req.query.price === '$500-$750') {
        price = {
            [Op.and]: [{
                [Op.gte]: 500
            }, {
                [Op.lt]: 750
            }]
        }
    }
    else if (req.query.price === 'I\'m ballin. It doesn\'t matter.') {
        price = {
            [Op.lt]: 1000000000
        }
    }
    else {
        price = {
            [Op.and]: [{
                [Op.gte]: 750
            }, {
                [Op.lt]: 1000
            }]
        }
    }

    let city = {}

    if (req.query.city === 'Houston') {
        city = "Houston"
    }
    else if (req.query.city === 'San Antonio') {
        city = "San Antonio"
    }
    else if (req.query.city == 'Austin') {
        city = "Austin"
    }
    else if (req.query.city == 'Dallas') {
        city = "Dallas"
    }
    else if (req.query.city == 'Fort Worth') {
        city = "Fort Worth"
    }
    else if (req.query.city == 'El Paso') {
        city = "El Paso"
    }
    else if (req.query.city == 'Amarillo') {
        city = "Amarillo"
    }
    else if (req.query.city == 'Tyler') {
        city = "Tyler"
    }
    else if (req.query.city == 'Galveston') {
        city = "Galveston"
    }
    else if (req.query.city == 'Lubbock') {
        city = "Lubbock"
    }
    else {
        city = {
        [Op.or]: ["Houston", "San Antonio", "Austin", "Dallas", "Fort Worth", "El Paso", "Amarillo", "Tyler", "Galveston", "Lubbock"]
        }   
    }

    let age = {}
    if (req.query.age === 'Puppy') {
        age = "Puppy"
    }
    else if (req.query.age === 'Adult') {
        age = "Adult"
    }
    else if (req.query.age === 'Senior') {
        age = 'Senior'
    }
    else {
        age = {
        [Op.or]: ["Puppy", "Adult", "Senior"]
        }
    }

    db.Dog.findAll({
        where: {
            breed: req.query.breed,
            gender: gender,
            age: age,
            adoption_fee: price,
            location: city
        }
    }) 
        .then((dogs) => {
            var resultsArr = dogs.map((obj) => {return obj.dataValues})
            console.log('dogs', resultsArr)
            console.log(req.user.cart)
            res.render('home', {
                dogData: resultsArr,
                adoptData: req.user.cart,
                user: req.user
            })
            console.log('req.user :', req.user)
            console.log('req.session.passport.user :', req.session.passport.user)
        })
        .catch((err) => {
            console.log('Error', err)
        })
})
router.post('/adopt', (req, res) => {
    // console.log('req.body: ', req.body)
    db.Cart.create({dog_id: req.body.dogID, user_id: req.user.id})
    
        .then((cartItem) => {
            console.log('cartItem', cartItem)
            res.redirect('/')
        })
        .catch((err) => {
            console.log('Error', err)
        })
})

// router.get('/users/:username', (req, res) => {
//    console.log(req.params.username)
//    console.log(req.query.name)
//  })

 // router.post('/signup', (req, res) => {
 //   console.log(req.body)
 // })

// method="/users/eli?name=max&birthday=october"
module.exports = router

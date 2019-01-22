const express = require("express")
const router = express.Router()
const query = require('./queries/query.js')
const Sequelize = require('sequelize');
const Op = Sequelize.Op
const db = require('../models')

router.get('/dogs', (req, res) => {
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
    else {
        price = {
            [Op.and]: [{
                [Op.gte]: 750
            }, {
                [Op.lt]: 1000
            }]
        }
    }

    db.Dog.findAll({
        where: {
            breed: req.query.breed,
            gender: gender,
            age: req.query.age,
            adoption_fee: price,
            location: req.query.city
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
    console.log('req.body: ', req.body)
    db.Cart.create({dog_id: req.body.dogID, user_id: req.user.id})
    
        .then((cartItem) => {
            console.log('cartItem', cartItem)
            res.redirect('/')
        })
        .catch((err) => {
            console.log('Error', err)
        })
})


// search Dog table by breed, filter for "like" search
router.get('/breed', (req, res) => {
    db.Dog.aggregate('breed', 'DISTINCT', {
        where: {
            breed:{
                [Op.like]: '%' + req.query.breed + '%'
            }
        },
        plain:false})
    .then((breedObj) => {
        var breedVal = breedObj.map((arr) => {
            var breedValues = Object.values(arr)
            return breedValues
        })
        var breedArr = breedVal.reduce(function(prev, curr) {
            return prev.concat(curr);
          })
        console.log(breedArr)
        res.send(breedArr)
    })
})

module.exports = router
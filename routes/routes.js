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
            res.render('home', {
                dogData: resultsArr
            })
        })
        .catch((err) => {
            console.log('Error', err)
        })
})

router.get('/login', (req, res) => {
   console.log(req.query)

   db.User.findAll({
        where: {
          emailLogin: req.query.email,
          passwordLogin: req.query.password
        }
   })
        .then((users) => {
            console.log('users', users.map((obj) => {return obj.dataValues}))

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
        var breedArr = [].concat(breedVal)
        var breedVal = breedObj.map((arr) => {
            var breedValues = Object.values(arr)
            return breedValues
        })
        // breedVal.forEach((e) => {
        //     breedArr.concat(e)
        // })
        console.log(breedVal)
        console.log(breedArr.flat())
        return breedArr
    })
})

module.exports = router

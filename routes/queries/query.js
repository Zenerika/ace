const db = require('../../models')

// console.log(db)
// console.log(db.User.findAll())
const filterDogs = (breed, gender, age, price, city) => {

    return db.User.findAll({
        where: {
            breed: breed,
            gender: gender,
            age: age,
            adoption_fee: price,
            location: city
        }
    })
        
}

module.exports = {
    filterDogs: filterDogs
}
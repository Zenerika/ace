const db = require('../../models')

// console.log(db)
// console.log(db.User.findAll())
const filterDogs = (breed, gender, age, price, city) => {

    return db.Dog.findAll({
        where: {
            breed: breed,
            gender: gender,
            age: age,
            adoption_fee: price,
            location: city
        }
    })

}

const filterUsers = (emailLogin, passwordLogin) => {

  return db.User.findAll({
      where: {
        email: emailLogin,
        password: passwordLogin
      }
  })

}

module.exports = {
    filterDogs: filterDogs,
    filterUsers: filterUsers
}

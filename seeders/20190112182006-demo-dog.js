'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Dog', [{
        name: 'Lars',
        adoption_fee: '200',
        location: 'Houston',
        gender: 'M',
        age: 'adult',
        breed: 'weimaraner',
        image_url: 'https://images.dog.ceo/breeds/weimaraner/n02092339_3028.jpg'
      }], {}).catch(console.warn);
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Dog', null, {});
  }
};

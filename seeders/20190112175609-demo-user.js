'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('User', [{
        email: 'demo@demo.com',
        password: 'password',
        first_name: 'John',
        last_name: 'Doe'
      }], {}).catch(console.warn);
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('User', null, {});
  }
};
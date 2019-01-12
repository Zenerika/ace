'use strict';
module.exports = (sequelize, DataTypes) => {
  const dog = sequelize.define('Dog', {
    name: DataTypes.STRING,
    adoption_fee: DataTypes.INTEGER,
    location: DataTypes.STRING,
    gender: DataTypes.STRING,
    age: DataTypes.STRING,
    breed: DataTypes.STRING,
    image_url: DataTypes.STRING
  }, {});
  dog.associate = function(models) {
    // associations can be defined here
  };
  return dog;
};
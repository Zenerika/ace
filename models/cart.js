'use strict';
module.exports = (sequelize, DataTypes) => {
  const cart = sequelize.define('Cart', {
        dog_id: DataTypes.INTEGER,
        user_id: DataTypes.INTEGER,
  }, {
    timestamps: false,
    freezeTableName: true
  });
  cart.associate = function(models) {
    // associations can be defined here
  };
  return cart;
};

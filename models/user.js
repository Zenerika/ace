'use strict';
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    first_name: DataTypes.STRING,
    last_name: DataTypes.STRING
  }, {
    timestamps: false,
    freezeTableName: true
  });
  User.associate = function(models) {
    // associations can be defined here
    User.belongsToMany(models.Dog, { through: models.Cart,foreignKey: 'user_id' })
  };
  return User;
};
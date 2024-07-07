const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(`${process.env.DATABASE_URL}`, {
  dialectModule: require("pg"),
});

module.exports = sequelize;

/*
process.env.

*/

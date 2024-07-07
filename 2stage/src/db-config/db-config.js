const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  "user-and-organisation",
  process.env.DATABASE_NAME,
  process.env.DATABASE_PASSWORD,
  {
    host: "localhost",
    dialect: "postgres",
  }
);

module.exports = sequelize;

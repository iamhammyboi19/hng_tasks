const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  process.env.DATABASE_URL,
  { dialectModule: require("pg") }
  // { dialect: "postgres" }
);

sequelize
  .sync()
  .then(() => {
    console.log("synced successfully");
  })
  .catch((err) => {
    console.log("error from sequelize: ", err);
  });

module.exports = sequelize;

/*


*/

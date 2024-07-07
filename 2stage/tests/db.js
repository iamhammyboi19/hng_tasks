const sequelize = require("../src/db-config/db-config");
const { User } = require("../src/model/userModel");

const sampleuser = {
  email: "firsttestuser@example.com",
  firstName: "First",
  lastName: "TestUser",
  password: "test1234",
};

const createFirstUserOnTest = async () => {
  //
  await User.create(sampleuser);
};

module.exports = createFirstUserOnTest;

const sequelize = require("../db-config/db-config");

const User_and_Organisations = sequelize.define("users_and_organisations", {
  ownerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: { notNull: "Please provide organisation's owner" },
  },
});

module.exports = User_and_Organisations;

const CustomError = require("../utils/CustomError");
const sequelize = require("../db-config/db-config");
const { DataTypes } = require("sequelize");

const Organisation = sequelize.define("organisations", {
  ordId: {
    type: DataTypes.STRING,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isNotEmpty(value) {
        if (value === "") {
          throw new CustomError("First name is a required field", 422);
        }
      },
    },
    trim: true,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "User",
      key: "userId",
    },
  },
});

module.exports = Organisation;

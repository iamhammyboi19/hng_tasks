const { DataTypes } = require("sequelize");
const sequelize = require("../db-config/db-config");
const { Sequelize } = require("sequelize");
const CustomError = require("../utils/CustomError");
const validator = require("email-validator");
const phone = require("phone");

const User = sequelize.define(
  "user",
  {
    user_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isNotEmpty(value) {
          if (value === "" || value === null) {
            throw new CustomError("First name is a required field", 422);
          }
        },
      },
      trim: true,
    },
    lastName: {
      type: DataTypes.STRING,
      // allowNull: false,
      validate: {
        isNotEmpty(value) {
          if (value === "" || value === null) {
            throw new CustomError("Last name is a required field", 422);
          }
        },
      },
      trim: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isNotEmail(value) {
          if (!validator.validate(value)) {
            throw new CustomError(`${value} is not a valid email address`, 422);
          }
        },
      },
      trim: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isNotPassword(value) {
          if (String(value).length < 8) {
            throw new CustomError(
              `Password must be at least 8 characters`,
              422
            );
          }
        },
      },
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
      trim: true,
    },
  },
  { freezeTableName: true }
);

const Organisation = sequelize.define(
  "organisation",
  {
    org_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
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

    org_owner_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  },
  { freezeTableName: true }
);

User.belongsToMany(Organisation, {
  through: "User_and_Organisations",
  foreignKey: "creator_id",
});
Organisation.belongsToMany(User, {
  through: "User_and_Organisations",
  foreignKey: "org_id",
});

exports.User = User;
exports.Organisation = Organisation;

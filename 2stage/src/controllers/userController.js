const jwt = require("jsonwebtoken");
const { User, Organisation } = require("../model/userModel");
const { promisify } = require("util");
const bcrypt = require("bcrypt");
const sequelize = require("../db-config/db-config");
const CustomError = require("../utils/CustomError");

const createToken = async (id) => {
  const generate_jwt = promisify(jwt.sign);
  return await generate_jwt(
    {
      id,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

exports.signupUser = async (req, res, next) => {
  try {
    // create user
    const { firstName, lastName, email, password, phone, description } =
      req.body;
    const encrypted_pass = await bcrypt.hash(password, 12);
    await sequelize.sync({});
    const user = await User.create({
      firstName,
      lastName,
      email,
      phone,
      password: encrypted_pass,
    });

    // if user is created -> create organisation under the user
    if (user) {
      try {
        const name = `${user?.firstName}'s Organisation`;
        await sequelize.sync({});
        const organisation = await Organisation.create({
          org_owner_id: user.userId,
          name,
          description,
        });
        await sequelize.sync({});
        await user.addOrganisation(organisation);
      } catch (err) {
        return next(err);
      }
    }

    const accessToken = await createToken(user.userId);

    res.status(201).json({
      status: "success",
      message: "Registration successful",
      data: {
        accessToken,
        user: {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone || null,
        },
      },
    });
  } catch (err) {
    console.log("err", err);
    return res
      .status(400)
      .json({ message: "Registration unsuccessful", status: "Bad request" });
  }
};

exports.loginUser = async (req, res, next) => {
  try {
    //
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        message: "There is no user with this email address",
        status: "Bad request",
      });
    }

    const check_pass = await bcrypt.compare(password, user.password);
    if (!check_pass) {
      return res.status(401).json({
        message: "Authentication failed",
        status: "Bad request",
      });
    }

    const accessToken = await createToken(user.userId);
    res.status(200).json({
      status: "success",
      message: "Login in successful",
      data: {
        accessToken,
        user: {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone || null,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.protectedUser = async (req, res, next) => {
  try {
    const user_token =
      req.headers.authorization?.split(" ")[1] || req?.cookies?.jwt;
    //

    if (!user_token) {
      return next(
        new CustomError(
          `Unauthorized access. Please login your account to access this page`,
          401
        )
      );
    }

    // check and verfiy user_token
    const user_verified = await promisify(jwt.verify)(
      user_token,
      process.env.JWT_SECRET
    );

    // find user with the id generated from verified token
    const user = await User.findOne({ where: { userId: user_verified.id } });
    if (!user) {
      return next(
        new CustomError(`There is no user found with this token`, 404)
      );
    }

    req.currentUser = user;
    return next();
  } catch (err) {
    next(err);
  }
};

exports.getSpecificUser = async (req, res, next) => {
  try {
    //
    const { userId } = req.currentUser;
    const { id } = req.params;

    if (String(userId) !== String(id)) {
      return next(new CustomError("You cannot get another user's record", 400));
    }

    const user = await User.findOne({ where: { userId: id } });

    if (!user) {
      return next(new CustomError("There is no user with this id", 404));
    }

    res.status(200).json({
      status: "success",
      message: "User successfully retrived",
      data: {
        userId: user.userId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone || null,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getSpecificUserOrganisations = async (req, res, next) => {
  try {
    const { userId } = req.currentUser;
    const ownOrgs = await Organisation.findAll({
      where: { org_owner_id: userId },
    });
    const curUser = await User.findOne({ where: { userId } });
    const org = await curUser.getOrganisations();
    res.status(200).json({
      status: "success",
      message: "Organisations successfully retrived",

      data: { org, ownOrgs },
    });
  } catch (err) {
    next(err);
  }
};

exports.getSpecificOrganisation = async (req, res, next) => {
  try {
    const { orgId } = req.params;
    const org = await Organisation.findOne({
      where: { orgId },
    });
    if (!org) {
      return next(
        new CustomError("There is no organisation with this ID", 404)
      );
    }
    res.status(200).json({
      status: "success",
      message: "Organisations successfully retrived",
      data: { org },
    });
  } catch (err) {
    next(err);
  }
};

exports.createOrganisation = async (req, res, next) => {
  try {
    const { description, name } = req.body;
    const user = req.currentUser;

    if (!name) {
      return next(new CustomError("Organisation must have a name", 422));
    }

    await sequelize.sync({});
    const organisation = await Organisation.create({
      org_owner_id: user.userId,
      name,
      description,
    });
    await sequelize.sync({});
    await user.addOrganisation(organisation);

    res.status(200).json({
      status: "success",
      message: "Organisation created successfully",
      data: organisation,
    });
  } catch (err) {
    next(err);
  }
};

exports.addUserToOrganisation = async (req, res, next) => {
  try {
    const { userId } = req.body;
    const user = req.currentUser;
    const { orgId } = req.params;

    const organisation = await Organisation.findOne({
      where: { orgId, org_owner_id: user.userId },
    });

    const user_to_add = await User.findByPk(userId);

    if (!user_to_add) {
      return next(new CustomError("There is no user with this ID", 404));
    }

    if (!organisation) {
      return next(
        new CustomError(
          "There is no organisation with this ID or you are not the owner of this organisation",
          404
        )
      );
    }

    // await sequelize.sync({});
    await user.addOrganisation(organisation);

    res.status(200).json({
      status: "success",
      message: "User added to organisation successfully",
    });
  } catch (err) {
    next(err);
  }
};

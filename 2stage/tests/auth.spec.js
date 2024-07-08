const request = require("supertest");
const { User, Organisation } = require("../src/model/userModel.js");
const app = require("../api/index.js");
const sequelize = require("../src/db-config/db-config.js");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");

/* TESTS FOR USER SIGNUP */
test("Should sign up a new user create default organisation for signed up user and send accessToken", async () => {
  const response = await request(app).post("/auth/register").send({
    firstName: "My New",
    lastName: "Test User",
    email: "mynewtestuser@example.com",
    password: "test4321",
    phone: "+2349010006600",
  });

  const user = response.body.data.user;
  expect(user).toBeDefined();
  const token = response.body.data.accessToken;
  expect(token).toBeDefined();
  const organisation = response.body.data.organisation;
  expect(organisation).toBeDefined();
}, 10000);

test("Should Fail If Required Fields Are Missing", async () => {
  const response = await request(app).post("/auth/register").send({
    firstName: "Third",
    email: "thirduser@example.com",
    password: "test4321",
  });

  expect(response.status).toBe(422);
});

test("Should fail trying to register a user with an existing email", async () => {
  const response = await request(app)
    .post("/auth/register")
    .send({
      firstName: "New",
      lastName: "User",
      email: "seconduser@example.com",
      password: "test4321",
      phone: "+2348060009000",
    })
    .expect(400);

  expect(response.body.message).toBe(
    "User with this email address already exists"
  );
});

test("Should Log the user in successfully and verify accessToken", async () => {
  const response = await request(app).post("/auth/login").send({
    email: "seconduser@example.com",
    password: "test4321",
  });

  const user_token = response.body.data.accessToken;

  // check and verfiy user_token
  const user_verified = await promisify(jwt.verify)(
    user_token,
    process.env.JWT_SECRET
  );

  // find user with the id generated from verified token
  const user = await User.findOne({ where: { user_id: user_verified.id } });

  expect(user.firstName).toBe("Second");
  expect(response.status).toBe(200);
  expect(response.body.data).toHaveProperty("accessToken");
});

test("Should fail if login details are incorrect", async () => {
  const response = await request(app).post("/auth/login").send({
    email: "nonexistinguser@example.com",
    password: "passwillnotwork",
  });

  expect(response.status).toBe(401);
  expect(response.body.status).toBe("Bad request");
  expect(response.body.message).toBe(
    "There is no user with this email address"
  );
});

test("Should Fail if user is unauthorized", async () => {
  const response = await request(app).get("/api/organizations");

  expect(response.status).toBe(401);
  expect(response.body.message).toBe(
    "Unauthorized access. Please login your account to access this page"
  );
});

test("Should throw JWT error after verifying expired JWT Token", async () => {
  const response = await request(app).post("/auth/login").send({
    email: "seconduser@example.com",
    password: "test4321",
  });

  // JWT NEEDS TO BE SET TO 60ms
  const token = response.body.data.accessToken;
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  expect(() => {
    throw new Error(decoded);
  }).toThrow("jwt expired");
});

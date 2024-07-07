const router = require("express").Router();
const { loginUser, signupUser } = require("../controllers/userController");

router.post("/register", signupUser);
router.post("/login", loginUser);

module.exports = router;

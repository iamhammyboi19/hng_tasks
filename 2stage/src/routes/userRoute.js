const router = require("express").Router();
const {
  getSpecificUserOrganisations,
  getSpecificUser,
  protectedUser,
  createOrganisation,
  addUserToOrganisation,
} = require("../controllers/userController");

router.use(protectedUser);
router.get("/users/:id", getSpecificUser);
router.get("/organisations", getSpecificUserOrganisations);
router.post("/organisations", createOrganisation);
router.get("/organisations/:orgId", getSpecificUserOrganisations);
router.post("/organisations/:orgId/users", addUserToOrganisation);

module.exports = router;

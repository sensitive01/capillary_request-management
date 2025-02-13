const express = require("express");
const crediantialRoute = express.Router();
const crediantialController = require("../controllers/crediantialController")



crediantialRoute.post("/api-crediantials",crediantialController.createCrediantials)


module.exports = crediantialRoute
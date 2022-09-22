const express = require("express");
const campaignRoutes = require("./campaigns");

const router = express.Router();

router.use("/campaigns", campaignRoutes);

module.exports = router;

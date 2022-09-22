const express = require("express");
const { campaignController } = require("../controllers/index");

const router = express.Router();

router.get("/", campaignController.index);

router.get("/:campaignID", campaignController.indexByID);

router.post("/createPrivateKey", campaignController.createPrivateKey);

router.post("/verifyAirdrop", campaignController.verifyAirdrop);

//router.post("/", campaignController.store);

router.put("/createERC20Drop", campaignController.createERC20Drop);

router.get("/:id", campaignController.show);

router.delete("/:id", campaignController.destroy);

router.put("/:id", campaignController.update);

module.exports = router;

const { Campaign } = require("../database/models");
const crypto = require("crypto");
const { ethers } = require("hardhat");
const GAS = {
  gasPrice: 250000000000,
  gasLimit: 8000000
};

const hardHatConfig = require("../../hardhat.config.js");
const RPC_URL = hardHatConfig.networks[process.env.CHAIN_NETWORK].url;
const PROVIDER = new ethers.providers.JsonRpcProvider(RPC_URL);

const indexByID = async (req, res) => {
  try {
    const campaign = await Campaign.findOne({
      campaignID: req.params.campaignID
    }).exec();

    res.status(200).json({ campaign });
  } catch (error) {
    console.error(error, "Could not find campaign: {}", req.params.campaignID);
    res.status(500).json({ error });
  }
};

const index = async (_req, res) => {
  try {
    const campaigns = await Campaign.find().sort({ createdAt: -1 }).exec();

    res.json({ campaigns });
  } catch (error) {
    console.error(error, "Could not retrieve campaigns: {}", error.message);
    res
      .json({ error: error, message: "Could not retrieve campaigns" })
      .status(500);
  }
};

const verifyAirdrop = async (req, res) => {
  try {
    let temp = req.body;

    const campaign = await Campaign.findOne({
      campaignID: temp.campaignID
    }).exec();

    if (campaign == null || undefined) {
      return res.status(200).json({ error: "campaign is not defined" });
    }

    if (
      campaign.campaignID !== temp.campaignID ||
      campaign.costPerNum !== temp.costPerNum ||
      campaign.dropAddress !== temp.dropAddress ||
      campaign.network !== temp.network
    ) {
      // MOOG : take out client
      console.log("campaign info is not matched");
      return res.status(200).json({ error: "verification failed" });
    }

    let DropJson = require("../../artifacts/contracts/LinkDropProd.sol/LinkDropProd.json");
    var privateKey = campaign.privateKey;
    console.log("campaign.publickey", campaign.publicKey);
    console.log("campaign.privateKey", campaign.privateKey);
    var validator = new ethers.Wallet(privateKey, PROVIDER);
    console.log("validator", validator);

    let Drop = new ethers.Contract(temp.dropAddress, DropJson.abi, PROVIDER);

    let linkChecker = await Drop.connect(
      validator
    ).getLinksByIndexFromValidator(temp.id);

    console.log("linkChecker", linkChecker);
    if (linkChecker == false) {
      return res
        .status(200)
        .json({ error: "the link has already been airdropped" }); // MOOG : add error
    }

    if (temp.puzzle.length !== 66) {
      return res.status(200).json({ error: "invalid puzzle" }); // MOOG : add error
    }

    let isPuzzle = await Drop.connect(validator).verifyPuzzle(
      temp.id,
      temp.puzzle
    );

    console.log("isPuzzle", isPuzzle);
    if (isPuzzle == false) {
      return res.status(200).json({ error: "invalid puzzle" }); // MOOG : add error
    }

    let cpn;
    cpn = String(temp.id);
    cpn += String(await Drop.costPerNum());
    cpn += temp.campaignID;
    const { arrayify, id } = require("ethers/lib/utils");
    let claimerSignature = await validator.signMessage(arrayify(id(cpn)));

    console.log("claimerSignature", claimerSignature);
    let validSignature = await Drop.connect(validator).isValidSignature(
      temp.id,
      claimerSignature
    );

    console.log("validSignature", validSignature);
    if (validSignature == false) {
      return res.status(200).json({ error: "invalid signature" }); // MOOG : add error
    }

    let booleanLinks = await Drop.connect(validator).getLinksFromValidator();
    console.log("booleanLinks[temp.id]", booleanLinks[temp.id]);
    if (booleanLinks[temp.id] !== true) {
      return res
        .status(200)
        .json({ error: "the link has already been airdropped" }); // MOOG : add error
    }

    console.log("airdrop start");
    // console.log(
    //   "temp.id:",
    //   temp.id,
    //   "temp.costPerNum:",
    //   temp.costPerNum,
    //   "temp.wallet:",
    //   temp.wallet,
    //   "claimerSignature:",
    //   claimerSignature,
    //   "GAS:",
    //   GAS
    // );
    let tx;
    await Drop.connect(validator)
      .airdrop(
        temp.id, // 링크 인덱스
        ethers.utils.parseEther(temp.costPerNum), // 에어드랍 개 수
        temp.wallet, // 에어드랍 받는 사람의 지갑 주소
        claimerSignature,
        GAS
      )
      .then(function (txObj) {
        tx = txObj;
      });
    await tx.wait();

    res.status(201).json({ campaign: campaign });
  } catch (error) {
    console.error(error, "Error verifying airdrop: {}");
    //let errStatus = error.name === "ValidationError" ? 400 : 500;
    res.status(200).json({ error });
  }
};

const createPrivateKey = async (req, res) => {
  try {
    const campaign = new Campaign(req.body);

    // generating validator private key
    var id = crypto.randomBytes(32).toString("hex");
    var privateKey = "0x" + id;
    var validator = new ethers.Wallet(privateKey);
    campaign.privateKey = privateKey;
    campaign.publicKey = validator.address;

    const createdCampaign = await campaign.save();
    res.status(201).json({ campaign: createdCampaign });
  } catch (error) {
    console.error(error, "Error creating campaign: {}");
    //let errStatus = error.name === "ValidationError" ? 400 : 500;
    res.status(200).json({ error });
  }
};

const createERC20Drop = async (req, res) => {
  try {
    let campaign = new Campaign(req.body);
    let DropJson = require("../../artifacts/contracts/LinkDropProd.sol/LinkDropProd.json");

    const privateKey = campaign.privateKey;
    console.log("campaign privateKey: ", privateKey);
    const validator = new ethers.Wallet(privateKey, PROVIDER);
    console.log("validator:", validator);
    const DropFactory = new ethers.ContractFactory(
      DropJson.abi,
      DropJson.bytecode,
      validator
    );

    let Drop;
    Drop = await DropFactory.deploy(
      campaign.tokenAddress,
      campaign.client,
      campaign.duration,
      String(ethers.utils.parseEther(campaign.amount)),
      campaign.numLink,
      campaign.campaignID,
      GAS
    );
    await Drop.deployTransaction.wait();
    console.log("contract deployed");
    req.body.dropAddress = Drop.address;
    req.body.costPerNum = ethers.utils.formatEther(
      String(await Drop.costPerNum())
    );

    console.log("before create link");
    for (var i = 0; i < campaign.numLink; i++) {
      let tx = "";
      await Drop.connect(validator)
        .addLink(GAS)
        .then(function (txObj) {
          //console.log("addLink() tx result: ", txObj);
          tx = txObj;
        });
      await tx.wait();
      console.log("link " + i + " created");
    }

    campaign = await Campaign.findOneAndUpdate(
      { campaignID: req.body.campaignID },
      req.body,
      {
        new: true
      }
    ).exec();

    console.log("capaign updagted");

    res.status(200).json({ campaign });
  } catch (error) {
    console.error(error, "Error creating campaign: {}");
    //let errStatus = error.name === "ValidationError" ? 400 : 500;
    res.status(200).json({ error });
  }
};

// const store = async (req, res) => {
//   try {
//     const campaign = new Campaign(req.body);

//     let DropJson = require("../../artifacts/contracts/LinkDropProd.sol/LinkDropProd.json");

//     var validator = new ethers.Wallet(
//       "0x081e41014aee92916452d80c17316922bc6e603d7f3f6692587f6899233acde8",
//       PROVIDER
//     );

//     const DropFactory = new ethers.ContractFactory(
//       DropJson.abi,
//       DropJson.bytecode,
//       validator
//     );

//     const Drop = await DropFactory.deploy(
//       "0xA71DAC112a0B4a440a6649FA919cabD141B95DE7",
//       campaign.client,
//       campaign.duration,
//       campaign.amount,
//       campaign.numLink,
//       campaign.campaignID
//     );
//     await Drop.deployTransaction.wait();
//     campaign.dropAddress = Drop.address;

//     for (var i = 0; i < campaign.numLink; i++) {
//       await Drop.connect(validator)
//         .addLink(GAS)
//         .then(function (tx) {
//           tx.wait();
//         });
//     }

//     const createdCampaign = await campaign.save();
//     res.status(201).json({ campaign: createdCampaign });
//   } catch (error) {
//     console.error(error, "Error creating campaign: {}");
//     //let errStatus = error.name === "ValidationError" ? 400 : 500;
//     res.status(200).json({ error });
//   }
// };

const show = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id).exec();

    res.status(200).json({ campaign });
  } catch (error) {
    console.error(error, "Could not find campaign: {}", req.params.id);
    res.status(200).json({ error });
  }
};

const destroy = async (req, res) => {
  try {
    await Campaign.findByIdAndRemove(req.params.id);

    res.status(204).send();
  } catch (error) {
    console.error(error, "Error finding campaign: {}", req.params.id);
  }
};

const update = async (req, res) => {
  try {
    const campaign = await Campaign.findByIdAndUpdate(req.params.id, req.body, {
      new: true
    }).exec();

    res.status(200).json({ campaign });
  } catch (error) {
    console.error(error, "Could not update campaign: {}", req.params.id);
    res.status(200).json({ error });
  }
};

module.exports = {
  indexByID,
  index,
  createPrivateKey,
  show,
  destroy,
  update,
  createERC20Drop,
  verifyAirdrop
  //store,
};

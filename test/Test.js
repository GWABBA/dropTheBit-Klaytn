// const Token = artifacts.require("Token");
const { expect } = require("chai");
const { arrayify, id } = require('ethers/lib/utils')

describe('LinkDrop Test Mode', function () {
  let Token, Drop
  let validator, client, addr2, addr3, addrs
  let campaignID = ''
  let duration = 30, cost = 10000, num = 10
  let test = 'test'

  before(async function () {
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    const charactersLength = characters.length
    for (let i = 0; i < 30; i++) {
      campaignID += characters.charAt(
        Math.floor(Math.random() * charactersLength)
      )
    }

    const [_validator, _client, _addr2, _addr3, ..._addrs] = await ethers.getSigners()
    validator = _validator
    client = _client
    addr2 = _addr2
    addr2 = _addr2
    addr3 = _addr3
    addrs = _addrs

    // contracts deployment
    const TokenContract = await ethers.getContractFactory('Token')
    Token = await TokenContract.connect(client).deploy()
    const DropContract = await ethers.getContractFactory('LinkDropTest')
    Drop = await DropContract.deploy(Token.address, client.address, duration, cost, num, campaignID)
  })

  it('checking constructors', async () => {
    // checking client's address is stored
    expect(await Drop.client()).to.equal(client.address);

    // checking validator's address is stored
    expect(await Drop.validator()).to.equal(validator.address);

    // checking startTime, duration, endTime
    expect(BigInt(await Drop.endTime())).to.equal(BigInt(await Drop.startTime()) + BigInt((duration * 60 * 60 * 24)))

    // checking cost, num, costPerNum
    expect(BigInt(await Drop.costPerNum())).to.equal(BigInt(await Drop.cost() / await Drop.num()))

    // checking campaignID
    expect(await Drop.campaignID()).to.equal(campaignID)

    // checking running boolean
    expect(await Drop.running()).to.equal(true)
  })

  it('creating links', async () => {
    for (var i = 0; i < num; i++) {
      await Drop.connect(validator).addLink()
    }
  })

  it('getLinks only creator', async () => {
    links = await Drop.connect(client.address).getLinks()
    expect(links.length).to.equal(num)
  })

  it('getLinksFromValidator in boolean', async () => {
    booleanLinks = await Drop.connect(validator).getLinksFromValidator()
    expect(booleanLinks.length).to.equal(num)
  })

  it('validator valid signature', async () => {
    for (var i = 0; i < num; i++) {
      cpn = String(i)
      cpn += String(await Drop.costPerNum())
      cpn += campaignID
      let claimerSignature2 = await validator.signMessage(arrayify(id(cpn)))
      expect(await Drop.isValidSignature(i, claimerSignature2)).to.equal(true)
    }
  })

  it("transfer fund from client(token creator) to contract", async function () {
    // fund contract
    await Token.connect(client).transfer(Drop.address, cost)
    const contractBalance = await Token.balanceOf(Drop.address);
    expect(await contractBalance.toNumber()).to.equal(cost);
  });

  it('airdropping index 4 to addr3', async () => {
    let i = 4
    cpn = String(i)
    cpn += String(await Drop.costPerNum())
    cpn += campaignID
    let claimerSignature = await validator.signMessage(arrayify(id(cpn)))
    await Drop.airdrop(i, links[i].balance.toBigInt(), addr3.address, claimerSignature)
    links = await Drop.connect(client).getLinks()
    expect(links[i].balance).to.equal(0)
    expect(links[i].pubwallet).to.equal(addr3.address)
    expect(links[i].taken).to.equal(true)
    expect(await Token.balanceOf(addr3.address)).to.equal(await Drop.costPerNum())
  })

  it('check whether link has been taken from validator', async () => {
    let i = 4
    booleanLinks = await Drop.connect(validator).getLinksFromValidator()
    expect(booleanLinks[i]).to.equal(true)
  })

  it('check whether link has been taken from validator by index', async () => {
    let i = 4
    booleanLink = await Drop.connect(validator).getLinksByIndexFromValidator(i)
    expect(booleanLink).to.equal(true)
  })

  it('cancel campaign', async () => {
    expect(BigInt(await Token.balanceOf(client.address))).to.equal(BigInt(await Token.totalSupply())-BigInt(await Drop.initialSupply()))
    await Drop.connect(client).cancelCampaign()
    expect(BigInt(await Token.balanceOf(client.address))).to.equal(BigInt(await Token.totalSupply())-BigInt(await Drop.costPerNum()))
  })

})
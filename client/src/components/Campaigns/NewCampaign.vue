<template>
  <div>
    <v-card class="mb-10">
      <v-card-title class="text-h4">Welcome to the Drop The Bit!</v-card-title>
      <v-card-text class="text-h6">
        <!-- <p class="text-h6"> -->
        <ul>
          <li>You must have sufficient Klaytn for gas.</li>
          <li>
            You must have a token minted on the Klaytn baobab testnet to distribute to
            users through dropthebit, it can be Klaytn. If you cannot mint a
            token to distribute as a test on the Klaytn baobab testne, please click one
            of the links from the google sheet below to claim some of our test
            token (FUFU).
            <br />
            <a
              href="https://docs.google.com/spreadsheets/d/1sQ7aIoZFntFDfQfRBhPBqrhQBOw5izbdbZcq4L8-YD8/edit?usp=sharing"
              target="_blank"
            >
              Click Here
            </a>
            <br />
            Each link can only be claimed ONCE, so if you require more links,
            please email us at tech@uwufufu.com with the subject line [SEND
            TESTNET TOKEN]
          </li>
          <li>
            Minimum 1 link, maximum up to 5 links can be generated for the
            prototype, but we plan to expand this significantly later.
          </li>
        </ul>
        <!-- </p> -->
      </v-card-text>
    </v-card>
    <v-card>
      <v-card-title v-if="!loading" class="primary bright--text">
        Fill out the form
      </v-card-title>
      <v-card-title v-else class="primary bright--text">
        Please be patient and do not close the window
        <br />
        <v-progress-linear
          color="warning"
          animated
          buffer-value="0"
          v-bind:value="progressBar"
          height="25"
          stream
        >
          <strong animated class="primary bright--text">
            {{ Math.ceil(this.progressBar) }}%
          </strong>
        </v-progress-linear>
      </v-card-title>

      <v-card-text>
        <v-form>
          <v-text-field v-model="campaignName" label="Name this campaign" />
          <v-text-field
            v-model="tokenAddress"
            label="Klaytn Baobab testnet Token Address"
          />
          <v-text-field
            v-model="amount"
            label="amount (total amount of ERC 20 Token being dropped)"
          />
          <v-text-field v-model="numLink" label="number of links" />
          <v-text-field v-model="duration" label="duration (by days)" />
        </v-form>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn color="success" @click="createCampaign()" :loading="loading">
          Submit
        </v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>

<script>
/* eslint-disable no-unused-vars */
/* eslint-disable no-unreachable */
/* eslint-disable comma-dangle */
/*eslint comma-dangle: ["error", "never"]*/
import { loadingStates } from '../../mixins/loading-state'
import { walletMethods } from '../../mixins/wallet-methods'
import TokenJson from '@/artifacts/contracts/Token.sol/Token.json'
let DropJson = require('@/artifacts/contracts/LinkDropProd.sol/LinkDropProd.json')
import Caver from 'caver-js' // or const Caver = require('caver-js')



export default {
  name: 'NewCampaignForm',
  mixins: [loadingStates, walletMethods],

  data: () => ({
    campaignName: 'airdrop campaign',
    // tokenAddress: '0x9343E00791A2B5FEEf51b6790C30E0d677a35B4a',
    //tokenAddress: '0x0F7068F2AB25E13C79B6B64EB4E20dDd6E54aa6A',
    //tokenAddress: '0xA71DAC112a0B4a440a6649FA919cabD141B95DE7',
    tokenAddress: '',
    amount: '100',
    amountInEther: '3',
    numLink: '1',
    campaignID: '',
    contractType: 'ERC20',
    client: '',
    duration: 244,
    //network: 'bsc-testnet',
    network: process.env.VUE_APP_CHAIN_NAME,
    gas: '1',
    progressBar: 0,
    provider: {},
    signer: {},
    loading: false,
    Token: {},
  }),
  computed: {
    campaignProgress() {
      return this.$store.getters['campaigns/CampaignDetail'] || []
    },
  },
  async mounted() {
    this.client = localStorage.getItem('client')
  },
  methods: {
    async createCampaign() {
      try {
        if (this.numLink < 0 || this.numLink > 5) {
          alert(
            'Minimum 1 link, maximum up to 5 links can be generated for the prototype'
          )
          return false
        }

        let progressResult = true

        this.loading = true
        // await this.checkBalanceAndToken()
        this.progressBar = 5
        console.log('createPrivateKey')
        progressResult = await this.createPrivateKey()
        if (!progressResult) return false
        this.progressBar = 10

        console.log('sendGasFee')
        progressResult = await this.sendGasFee()
        if (!progressResult) return false
        this.progressBar = 20

        console.log('createDropContract')
        progressResult = await this.createDropContract()
        if (!progressResult) return false
        this.progressBar = 80

        console.log('fundDropContract')
        progressResult = await this.fundDropContract()
        if (!progressResult) return false
        this.progressBar = 100 
        this.$emit('success', true)

        alert('links have been created. please check the campaign detail page')
        this.loading = false
        this.$router.push('/campaign')
      } catch (error) {
        console.log(error)
        // this.$emit('error', { error })
      }
    },
    async createPrivateKey() {
      try {
        this.campaignID = 'id' + Math.random().toString(16).slice(2)
        if (this.client == '' || this.client == undefined) {
          alert(
            'Client wallet address is missing. Please try again when the page is reloaded.'
          )
          this.$router.go(this.$router.currentRoute)
          return false
        }
        if (
          this.amount == '' ||
          this.numLink == '' ||
          this.tokenAddress == ''
        ) {
          alert('please input all the blank fields')
          return false
        }
        // creating private key and storing the data in campaignProgress
        const { error } = await this.$store.dispatch(
          'campaigns/CreatePrivateKey',
          {
            campaignName: this.campaignName,
            campaignID: this.campaignID,
            tokenAddress: this.tokenAddress,
            contractType: this.contractType,
            amount: this.amount,
            numLink: this.numLink,
            client: this.client,
            duration: this.duration,
            network: this.network,
          }
        ) // privateKey created

        if (error) {
          alert(error)
          this.$router.push('/')
          return false
        }

        if (
          (await this.campaignProgress.publicKey) == '' ||
          this.campaignProgress.publicKey == undefined ||
          this.campaignProgress.publicKey == null
        ) {
          alert('something went wrong. key not generated')
          return false
        }
        // this.$emit('success', newCampaign)
        return true
      } catch (error) {
        console.error(error)
      }
    },
    async sendGasFee() {
      const { klaytn } = window
      if (klaytn === undefined) return false

      try {
        console.log("sendGasFee start")
        let receiverAddress = this.campaignProgress.publicKey
        await window.caver.klay.sendTransaction({
          type: 'VALUE_TRANSFER',
          from: this.client,
          to: receiverAddress,
          value: window.caver.utils.toPeb(this.amountInEther, 'KLAY'),
          gas: 8000000
        }).then((receipt) => {
          console.log(receipt)
        })
        console.log("sendGasFee end")
        return true
      } catch (err) {
        console.log(err)
        alert('you rejected the transaction 🙈')
        return false
      }
    },
    async createDropContract() {

      console.log("createDropContract start")

      const { error } = await this.$store.dispatch(
        'campaigns/CreateERC20Drop',
        {
          id: await this.campaignProgress._id,
          data: this.campaignProgress,
        }
      )
      if (error) {
        const errorStr = typeof error == Object ? JSON.stringify(error) : error
        console.log(errorStr)
        alert(errorStr.reason)
        this.$router.push('/')
        return false
      }
      console.log("createDropContract end")
      return true
    },
    async fundDropContract() {
      const { klaytn } = window
      if (klaytn === undefined) return false

      /**
       * 드랍 컨트랙트가 클라이언트 지갑에서 클라이언트 토큰을 가져갈 수 있도록 approve 요청 
       */
      const caver = new Caver(window.klaytn)
      const tokenContractKip7 = new caver.klay.KIP7(this.campaignProgress.tokenAddress)
      await tokenContractKip7.approve(this.campaignProgress.dropAddress, Caver.utils.toPeb(this.amount, 'KLAY'), {
        from: this.client
      })
      console.log('approved')

       /**
       * 드랍 컨트랙트가 클라이언트 지갑에서 클라이언트 토큰을 가져갈 수 있도록 approve되었는지 확인 (몇개의 토큰에 대하여 권한이 있는지 출력) 
       */
      await tokenContractKip7.allowance(this.client, this.campaignProgress.dropAddress).then((allowance)=> {console.log('allowance check:', caver.utils.convertFromPeb(allowance))})

      console.log('dropAddress', this.campaignProgress.dropAddress)

      /**
       * 유저가 드랍 컨트랙트의 fundContract를 호출하여 유저의 지갑에서 드랍할 코인을 빼감 
       */
      const dropContract = new caver.klay.Contract(DropJson.abi, this.campaignProgress.dropAddress)
      console.log('this.amount', this.amount)
      await dropContract.methods.fundContract(Caver.utils.toPeb(this.amount, 'KLAY')).send({from: this.client, gas:8000000}).then(console.log)

      /**
       * 클라이언트가 에어드랍할 코인이 드랍 컨트랙트에 잘 배분되었는지 체크 (드랍 컨트랙트가 소유한 클라이언트의 코인 개 수를 로깅) 
       */
      const tokenContract = new caver.klay.Contract(TokenJson.abi, this.campaignProgress.tokenAddress)
      await tokenContract.methods.balanceOf(this.campaignProgress.dropAddress).call().then((balance) => {console.log('balance of ',  balance)})

      return true
    },
    // async checkBalanceAndToken() {
    //   // checking whether enough coins are in the balance
    //   // MOOG getting coin balance
    //   // let balance = await this.provider.getBalance(this.client)
    //   // let etherBalance = this.$ethers.utils.formatEther(balance)

    //   this.Token = new this.$ethers.Contract(
    //     this.tokenAddress,
    //     TokenJson.abi,
    //     this.provider
    //   )

    //   // MOOG getting token balance
    //   const result = await this.Token.balanceOf(this.client)
    //   const format = this.$ethers.utils.formatEther(result)
    //   console.log('token balance', format)

    //   return true
    // },
  },
}
</script>

<template>
  <div class="page-content">
    <v-layout justify-space-between align-content-center column>
      <v-layout justify-space-between align-content-center>
        <h2>Airdrop</h2>
      </v-layout>
    </v-layout>
  </div>
</template>

<script>
/* eslint-disable comma-dangle */
import { loadingStates } from '../mixins/loading-state'
import { walletMethods } from '../mixins/wallet-methods'

export default {
  name: 'CampaignsPage',
  mixins: [loadingStates, walletMethods],

  components: {},

  data: () => ({
    wallet: '',
    campaignID: '',
    id: '',
    balance: '',
    puzzle: '',
    dropAddress: '',
    network: '',
    resultMsg: '',
  }),
  async mounted() {
    const clientWalletAddr = await localStorage.getItem('client')
    if (clientWalletAddr === undefined || clientWalletAddr === null) {
      await this.startApp() 
    }
    // this.detectEthereum()
    // this.provider = new this.$ethers.providers.Web3Provider(
    //   window.ethereum,
    //   'any'
    // )
    // await this.provider.send('eth_requestAccounts', [])
    // this.signer = this.provider.getSigner()
    // localStorage.setItem('signer', this.signer)
    this.wallet = clientWalletAddr
    this.campaignID = this.$route.query.campaignID
    this.id = this.$route.query.id
    this.balance = this.$route.query.balance
    this.puzzle = this.$route.query.puzzle
    this.dropAddress = this.$route.query.dropAddress
    this.network = this.$route.query.network || 'klaytn_baobab'
    await this.verifyAirDrop()
  },
  methods: {
    async verifyAirDrop() {
      // creating private key and storing the data in campaignProgress
      const { error } = await this.$store.dispatch('campaigns/VerifyAirdrop', {
        campaignID: this.campaignID,
        id: this.id,
        costPerNum: this.balance,
        puzzle: this.puzzle,
        dropAddress: this.dropAddress,
        network: this.network,
        wallet: this.wallet,
      }) // privateKey created

      if (error) {
        alert(JSON.stringify(error))
        this.$router.push('/')
      } else {
        alert('you got the airdrop!')
        this.$router.push('/')
      }
    },
  },
}
</script>

<style></style>

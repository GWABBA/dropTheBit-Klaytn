<template>
  <div>
    <h1>total {{ links.length }}</h1>
    <v-btn>
      <json-excel :data="dlinks">Download Data</json-excel>
    </v-btn>
    <v-data-table
      :headers="headers"
      :items="links"
      disable-pagination
      hide-default-footer
      class="elevation-1"
    ></v-data-table>
  </div>
</template>

<script>
import DropJson from '@/artifacts/contracts/LinkDropProd.sol/LinkDropProd.json'
import JsonExcel from 'vue-json-excel'
import { walletMethods } from '../../../mixins/wallet-methods'
//import Caver from 'caver-js' // or const Caver = require('caver-js')


export default {
  name: 'TheCampaignsList',
  mixins: [walletMethods],
  components: {
    // CampaignsListRow,
    JsonExcel,
  },
  data: () => ({
    client: '',
    dlinks: [{}],
    links: [{}],
    headers: [
      { text: 'Link ID', value: 'id', align: 'start', sortable: true },
      {
        text: 'Not Taken',
        value: 'taken',
      },
      { text: 'Taken By', value: 'wallet' },
      { text: 'Balance', value: 'balance' },
    ],
    campaignID: '',
  }),

  computed: {
    campaign() {
      return this.$store.getters['campaigns/CampaignDetail'] || []
    },
  },
  async mounted() {
    this.campaignID = this.$route.query.campaignID
    await this.getLinks()
    await this.getDownloadableLinks()
  },
  methods: {
    async getLinks() {
      const { klaytn } = window
      if (klaytn === undefined) return false
      
      //const caver = new Caver(window.klaytn)
      const dropContract = new window.caver.klay.Contract(DropJson.abi, this.campaign.dropAddress)
      const response = await dropContract.methods.getLinks().call({ from: this.client })

      let temp = new Array(response.length)
      for (var i = 0; i < response.length; i++) {
        console.log(this.amount)
        temp[i] = {
          balance: this.$_ethers.utils.formatEther(response[i].balance),
          id: response[i].id,
          campaignID: response[i].campaignID,
          puzzle: response[i].puzzle,
          taken: response[i].taken,
          time: response[i].time,
          wallet: response[i].pubwallet,
        }
      }
      this.links = temp
    },
    getDownloadableLinks() {
      let temp = new Array(this.links.length)
      for (var i = 0; i < this.links.length; i++) {
        temp[i] = {
          id: this.links[i].id,
          link:
            // 'http://3.39.148.171/#/airdrop?campaignID=' +
            // 'http://43.200.42.76/#/airdrop?campaignID=' +
            process.env.VUE_APP_CLIENT_URL +
            '/airdrop?campaignID=' +
            this.campaignID +
            '&id=' +
            this.links[i].id +
            '&balance=' +
            this.links[i].balance +
            '&puzzle=' +
            this.links[i].puzzle +
            '&dropAddress=' +
            this.campaign.dropAddress +
            '&network=' +
            this.campaign.network,
        }
        this.dlinks = temp
      }
    },
  },
 
}
</script>

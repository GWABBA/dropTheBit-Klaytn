<template>
  <v-list-item class="user-row elevation-2">
    <v-layout row align-content-center justify-space-between pa-3>
      <div class="d-flex flex-column align-start pl-1">
        <div class="d-flex">campaign name : {{ campaign.campaignName }}</div>
        <div class="d-flex">cosPerNum : {{ campaign.costPerNum }}</div>
        <div class="d-flex">client address : {{ campaign.client }}</div>
        <div class="d-flex">campaign ID : {{ campaign.campaignID }}</div>
        <div class="d-flex">token address : {{ campaign.tokenAddress }}</div>
        <div class="d-flex">drop address : {{ campaign.dropAddress }}</div>
        <div class="d-flex">total amount : {{ campaign.amount }}</div>
        <div class="d-flex">number of link : {{ campaign.numLink }}</div>
        <div class="d-flex">drop type : {{ campaign.contractType }}</div>
        <div class="d-flex">duration : {{ campaign.duration }}</div>
        <div class="d-flex">createdAt : {{ campaign.createdAt }}</div>
        <!-- <div class="d-flex">privateKey : {{ campaign.privateKey }}</div> -->
        <div class="d-flex">publicKey : {{ campaign.publicKey }}</div>
        <!-- <div class="d-flex">gas : {{ campaign.gas }}</div>
        <div class="d-flex">gasTaken : {{ campaign.gasTaken }}</div> -->
        <div class="d-flex">network : {{ campaign.network }}</div>
      </div>
      <div class="d-flex align-center">
        <v-btn
          @click="seeDetail()"
          class="error bright--text align-self-center mr-2"
          icon
          :loading="usersLoading"
        >
          <v-icon>mdi-file-document</v-icon>
        </v-btn>
      </div>
    </v-layout>
  </v-list-item>
</template>

<script>
import { loadingStates } from '../../../mixins/loading-state'
// import { ModalService } from '../../../services/modal.service'

export default {
  name: 'CampaignListRow',
  mixins: [loadingStates],

  props: {
    campaign: {
      type: Object,
      required: true,
    },
  },

  data: () => ({
    showAddModal: false,
    showConfirmModal: false,
  }),

  methods: {
    toggleAddModal(show) {
      this.showAddModal = !!show
    },

    seeDetail() {
      // localStorage.setItem('campaignID', this.campaign.campaignID)
      this.$router.push({
        path: '/campaignDetail',
        query: {
          campaignID: this.campaign.campaignID,
        },
      })
    },
  },
}
</script>

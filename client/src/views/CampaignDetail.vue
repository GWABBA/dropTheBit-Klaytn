<template>
  <div class="page-content">
    <v-layout justify-space-between align-content-center column>
      <v-layout justify-space-between align-content-center>
        <h2>Campaign Detail</h2>
      </v-layout>
      <the-campaign-link-lists class="mt-5" />
    </v-layout>
  </div>
</template>

<script>
import TheCampaignLinkLists from '../components/Campaigns/TheCampaignsList/TheCampaignLinkLists.vue'
import { loadingStates } from '../mixins/loading-state'
//import { ModalService } from '../services/modal.service'

export default {
  name: 'CampaignsPage',
  mixins: [loadingStates],

  components: {
    // TheCampaignsList,
    TheCampaignLinkLists,
  },

  data: () => ({
    // campaign: {},
    client: '',
  }),

  methods: {
    showAddModal() {
      // ModalService.openGenericModal(NewCampaignForm)
    },
  },
  computed: {
    campaign() {
      return this.$store.getters['campaigns/CampaignDetail'] || []
    },
  },
  mounted() {
    const campaignID = this.$route.query.campaignID
    this.$store.dispatch('campaigns/GetByCampaignID', campaignID)
  },
}
</script>

<style></style>

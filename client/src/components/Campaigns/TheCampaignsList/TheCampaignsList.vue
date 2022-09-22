<template>
  <div>
    <v-list rounded flat two-line class="transparent">
      <campaigns-list-row
        v-for="campaign in campaigns"
        :key="campaign.campaignID"
        :campaign="campaign"
      />
    </v-list>
  </div>
</template>

<script>
import CampaignsListRow from './CampaignsListRow.vue'

export default {
  name: 'TheCampaignsList',

  components: {
    CampaignsListRow,
  },

  data: () => ({
    // users: [],
  }),

  computed: {
    campaigns() {
      return this.$store.getters['campaigns/Campaigns'] || []
    },
  },

  methods: {
    fetchCampaigns() {
      this.$store.dispatch('campaigns/GetAll')
    },
  },

  mounted() {
    this.fetchCampaigns()
  },
}
</script>

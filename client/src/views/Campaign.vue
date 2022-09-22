<template>
  <div class="page-content">
    <v-layout justify-space-between align-content-center column>
      <v-layout justify-space-between align-content-center>
        <h2>Campaign</h2>
      </v-layout>
      <the-campaigns-list class="mt-5" />
    </v-layout>
  </div>
</template>

<script>
import TheCampaignsList from '../components/Campaigns/TheCampaignsList/TheCampaignsList.vue'
import { loadingStates } from '../mixins/loading-state'
import { walletMethods } from '../mixins/wallet-methods'

export default {
  name: 'CampaignsPage',
  mixins: [loadingStates, walletMethods],
  components: {
    TheCampaignsList,
  },
  data: () => ({
    client: '',
  }),
  methods: {},
  mounted() {},
}
</script>

<style></style>

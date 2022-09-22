<template>
  <div class="page-content">
    <v-layout justify-space-between align-content-center column>
      <new-campaign class="mt-3" />
    </v-layout>
  </div>
</template>

<script>
import NewCampaign from '../components/Campaigns/NewCampaign.vue'
import { loadingStates } from '../mixins/loading-state'

export default {
  name: 'CampaignsPage',
  mixins: [loadingStates],

  components: {
    NewCampaign,
  },
}
</script>

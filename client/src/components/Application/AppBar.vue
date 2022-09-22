<template>
  <div>
    <v-progress-linear
      fixed
      v-if="loading"
      color="white"
      indeterminate
      class="elevation-25"
      style="z-index: 6"
    />

    <v-app-bar app clipped-left color="primary" class="bright--text">
      <v-btn icon @click="$emit('toggle-drawer')">
        <v-icon class="bright--text">mdi-menu</v-icon>
      </v-btn>
      <div class="d-flex align-center">
        <h1>Drop The Bit 💰</h1>
      </div>

      <v-spacer></v-spacer>

      <v-btn
        class="bright--text mr-3"
        @click="$vuetify.theme.dark = !$vuetify.theme.dark"
        icon
        depressed
      >
        <v-icon>
          {{
            !$vuetify.theme.dark
              ? 'mdi-weather-sunny'
              : 'mdi-moon-waxing-crescent'
          }}
        </v-icon>
      </v-btn>
      <v-btn
        v-if="client == '' || client == undefined"
        icon
        depressed
        tag="a"
        class="bright--text"
        target="blank"
        @click="connectWallet"
      >
        <v-icon>mdi-wallet</v-icon>
      </v-btn>
      <v-btn
        v-else
        depressed
        color="primary"
        tag="a"
        class="bright--text"
        target="blank"
      >
        {{ client }}
      </v-btn>
    </v-app-bar>
  </div>
</template>

<script>
import { loadingStates } from '../../mixins/loading-state'
import { walletMethods } from '../../mixins/wallet-methods'
export default {
  name: 'AppBar',
  mixins: [loadingStates, walletMethods],
  data: () => ({
    client: undefined,
  }),
  methods: {},
  computed: {
    loading() {
      return this.$store.getters.loading
    },
  },
}
</script>

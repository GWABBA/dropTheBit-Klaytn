<template>
  <v-navigation-drawer
    app
    clipped
    color="primary"
    v-model="value"
    :input="value"
    @update:mini-variant="$emit('input', value)"
  >
    <v-list nav>
      <v-list-item
        class="bright--text"
        v-for="navLink in navLinks"
        :key="navLink.route"
        :to="navLink.route"
        link
      >
        <v-list-item-icon>
          <v-icon color="bright">{{ navLink.icon }}</v-icon>
        </v-list-item-icon>
        <v-list-item-content>
          {{ navLink.text }}
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script>
export default {
  name: 'NavMenu',

  props: {
    value: {
      type: Boolean,
      required: true,
    },
  },

  data: () => ({
    navLinks: [
      {
        text: 'Create Campaign',
        route: '/create',
        icon: 'mdi-home',
      },
      {
        text: 'My Campaign',
        route: '/campaign',
        icon: 'mdi-format-list-bulleted',
      },

      // {
      //   text: 'Users',
      //   route: '/users',
      //   icon: 'mdi-account-group',
      // },
      // {
      //   text: 'Home',
      //   route: '/home',
      //   icon: 'mdi-account-group',
      // },
    ],
  }),
}
</script>

import Vue from 'vue'
import VueRouter from 'vue-router'
//import Home from '../views/Home.vue'
//import Users from '../views/Users.vue'
import Campaign from '../views/Campaign.vue'
import CreateCampaign from '../views/CreateCampaign.vue'
import CampaignDetail from '../views/CampaignDetail.vue'
import Airdrop from '../views/Airdrop.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'CreateCampaign',
    component: CreateCampaign,
  },
  {
    path: '/campaign',
    name: 'Campaign',
    component: Campaign,
  },
  {
    path: '/create',
    name: 'CreateCampaign',
    component: CreateCampaign,
  },
  {
    path: '/campaignDetail',
    name: 'CampaignDetail',
    component: CampaignDetail,
  },
  {
    path: '/airdrop',
    name: 'Airdrop',
    component: Airdrop,
  },

  // {
  //   path: '/home',
  //   name: 'Home',
  //   component: Home,
  // },
  // {
  //   path: '/users',
  //   name: 'Users',
  //   component: Users,
  // },
]

const router = new VueRouter({
  mode: 'history',
  routes,
})

export default router

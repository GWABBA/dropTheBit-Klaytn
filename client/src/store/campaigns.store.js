import { CampaignsService } from '../services/campaigns.service'
/* eslint-disable comma-dangle */
const campaignsGetterTypes = {
  campaignDetail: 'CampaignDetail',
  campaigns: 'Campaigns',
  loading: 'Loading',
  error: 'Error',
}

const campaignsMutationTypes = {
  setLoading: 'SetLoading',
  setSuccess: 'SetSuccess',
  setOneCampaign: 'SetOneCampaign',
  setError: 'SetError',
}

const campaignsActionTypes = {
  createERC20Drop: 'CreateERC20Drop',
  getByCampaignID: 'GetByCampaignID', //moog vuex 1
  get: 'GetAll',
  verifyAirdrop: 'VerifyAirdrop',
  createPrivateKey: 'CreatePrivateKey',
  add: 'Add',
  update: 'Update',
  delete: 'Delete',
}

const state = () => ({
  campaignOneState: undefined, //moog vuex 4
  records: undefined,
  loading: false,
  error: {},
})

const getters = {
  [campaignsGetterTypes.campaignDetail]: (state) => state.campaignOneState, //moog vuex 5
  [campaignsGetterTypes.campaigns]: (state) => state.records,
  [campaignsGetterTypes.loading]: (state) => state.loading,
  [campaignsGetterTypes.error]: (state) => state.error,
}

const mutations = {
  [campaignsMutationTypes.setLoading](state) {
    state.loading = true
  },

  [campaignsMutationTypes.setOneCampaign](state, campaignOne) {
    state.campaignOneState = campaignOne //moog vuex 3
    state.loading = false
  },

  [campaignsMutationTypes.setSuccess](state, campaignRecords) {
    state.records = campaignRecords
    state.loading = false
  },

  [campaignsMutationTypes.setError](state, error) {
    state.records = []
    state.loading = false
    state.error = error
  },
}

const actions = {
  async [campaignsActionTypes.getByCampaignID]({ commit }, campaignID) {
    commit(campaignsMutationTypes.setLoading) //moog vuex 2

    try {
      const response = await CampaignsService.getByCampaignID(campaignID)
      commit(campaignsMutationTypes.setOneCampaign, response.data.campaign)
      return response.data
    } catch (error) {
      console.error(error)
      commit(campaignsMutationTypes.setError)
    }
  },

  async [campaignsActionTypes.verifyAirdrop](
    { dispatch, commit },
    campaignData
  ) {
    commit(campaignsMutationTypes.setLoading)

    try {
      const response = await CampaignsService.verifyAirdrop(campaignData)
      commit(campaignsMutationTypes.setOneCampaign, response.data.campaign)
      dispatch(campaignsActionTypes.get, true)
      return response.data
    } catch (error) {
      console.log(JSON.stringify(error))
      alert(error)
      commit(campaignsMutationTypes.setError, error)
    }
  },

  async [campaignsActionTypes.createPrivateKey](
    { dispatch, commit },
    campaignData
  ) {
    commit(campaignsMutationTypes.setLoading)

    try {
      const response = await CampaignsService.createPrivateKey(campaignData)
      commit(campaignsMutationTypes.setOneCampaign, response.data.campaign)
      dispatch(campaignsActionTypes.get, true)
      return response.data
    } catch (error) {
      console.error(error)
      commit(campaignsMutationTypes.setError)
    }
  },

  async [campaignsActionTypes.add]({ dispatch, commit }, campaignData) {
    commit(campaignsMutationTypes.setLoading)

    try {
      const response = await CampaignsService.post(campaignData)
      dispatch(campaignsActionTypes.get, true)
      return response.data
    } catch (error) {
      console.error(error)
      commit(campaignsMutationTypes.setError)
    }
  },

  async [campaignsActionTypes.get]({ state, commit }, bustCache) {
    if (state.records && !bustCache) {
      return
    }

    commit(campaignsMutationTypes.setLoading)

    try {
      const response = await CampaignsService.get()
      commit(campaignsMutationTypes.setSuccess, response.data.campaigns)
      return response.data
    } catch (error) {
      console.error(error)
      commit(campaignsMutationTypes.setError)
    }
  },

  async [campaignsActionTypes.createERC20Drop]({ dispatch, commit }, payload) {
    commit(campaignsMutationTypes.setLoading)

    try {
      const response = await CampaignsService.createERC20Drop(payload.data)
      commit(campaignsMutationTypes.setOneCampaign, response.data.campaign)
      dispatch(campaignsActionTypes.get, true)
      return response.data
    } catch (error) {
      console.error(error)
      commit(campaignsMutationTypes.setError)
    }
  },

  async [campaignsActionTypes.update]({ dispatch, commit }, payload) {
    commit(campaignsMutationTypes.setLoading)

    try {
      const response = await CampaignsService.put(payload.id, payload.data)
      await dispatch(campaignsActionTypes.get, true)
      return response.data
    } catch (error) {
      console.error(error)
      commit(campaignsMutationTypes.setError)
    }
  },

  async [campaignsActionTypes.delete]({ dispatch, commit }, id) {
    commit(campaignsMutationTypes.setLoading)

    try {
      const response = await CampaignsService.delete(id)
      await dispatch(campaignsActionTypes.get, true)
      return response.data
    } catch (error) {
      console.error(error)
      await dispatch(campaignsActionTypes.get, true)
    }
  },
}

export const campaignsStoreModule = {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
}

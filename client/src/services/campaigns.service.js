import axios from 'axios'

export const CampaignsService = {
  http: axios.create({
    baseURL: process.env.VUE_APP_API_URL + '/api/campaigns',
    // baseURL: 'https://api.nanafy.com/api/campaigns',
    // baseURL: 'http://localhost:9000/api/campaigns',
    // baseURL: 'http://3.39.148.171:9000/api/campaigns',
    // baseURL: 'http://43.200.42.76:9000/api/campaigns',
  }),
  getByCampaignID(campaignID) {
    return this.http.get(`/${campaignID}`)
  },
  get() {
    return this.http.get()
  },
  createPrivateKey(campaignData) {
    return this.http.post('/createPrivateKey', campaignData)
  },
  createERC20Drop(campaignData) {
    return this.http.put('/createERC20Drop', campaignData)
  },
  verifyAirdrop(campaignData) {
    return this.http.post('/verifyAirdrop', campaignData)
  },
  post(campaignData) {
    return this.http.post('', campaignData)
  },
  put(id, campaignData) {
    return this.http.put(`/${id}`, campaignData)
  },
  delete(id) {
    return this.http.delete(`/${id}`)
  },
}

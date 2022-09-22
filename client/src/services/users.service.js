import axios from 'axios'

export const UsersService = {
  http: axios.create({
    baseURL: process.env.VUE_APP_API_URL + '/api/users',
    // baseURL: 'https://api.nanafy.com/api/users',
    // baseURL: 'http://localhost:9000/api/users',
    // baseURL: 'http://3.39.148.171:9000/api/users',
    // baseURL: 'http://43.200.42.76:9000/api/users',
  }),
  get() {
    return this.http.get()
  },
  post(userData) {
    return this.http.post('', userData)
  },
  put(id, userData) {
    return this.http.put(`/${id}`, userData)
  },
  delete(id) {
    return this.http.delete(`/${id}`)
  },
}

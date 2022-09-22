import { chainConfig } from '../../chain.config'
import Caver from 'caver-js'
const caver = new Caver('https://api.baobab.klaytn.net:8651/')

export const walletMethods = {
  /* eslint-disable comma-dangle */
  data: () => ({
    chainInfo: chainConfig[process.env.VUE_APP_CHAIN_NAME || 'klaytn_baobab'],
    balance: null,
  }),
  async mounted() {
    await this.startApp()
  },
  methods: {
    async startApp() {
      const { klaytn } = window

      if (klaytn) {
        try {
          await klaytn.enable()
          const account = klaytn.selectedAddress
          this.client = account
          localStorage.setItem('client', account)

          const balance = await caver.klay.getBalance(account)
          this.balance = caver.utils.fromPeb(balance, 'KLAY')
          console.log('current-account:', account, '/ balance:', this.balance)
          klaytn.on(
            'accountsChanged',
            async () => await this.setAccountInfo(klaytn)
          )
        } catch (error) {
          //alert('User denied account access')
        }
      } else {
        const msg =
          'Non-Kaikas browser detected. Please refresh the page after installing Kaikas.'
        if (confirm(msg)) {
          window.open(
            'https://chrome.google.com/webstore/detail/kaikas/jblndlipeogpafnldhgmapagcccfchpi',
            '_blank'
          )
        }
      }
    },
  },
}

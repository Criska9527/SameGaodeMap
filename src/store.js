import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    map: null,
    currentcity:null,
    keywords:null
  },
  mutations: {
    changemap(state, map) {
      this.state.map = map
    },
    changecity(state,currentcity){
      this.state.currentcity = currentcity
      //console.log(this.state.currentcity)
    },
    changekeywords(state,keywords){
      this.state.keywords = keywords
      //console.log(this.state.currentcity)
    },
  },
  actions: {
    sendmap(context, map) {
      context.commit('changemap', map)
    }
  }
})

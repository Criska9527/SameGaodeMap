import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    map: null
  },
  mutations: {
    changemap(state, map) {
      this.state.map = map
    }
  },
  actions: {
    sendmap(context, map) {
      context.commit('changemap', map)
    }
  }
})

import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    map: null,
    currentcity:null,
    keywords:null,
    currentinput:null,
    status:{
      listshow:true,
      detailshow:false
    },
    stateinput:null,
    searchkey:''
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
    changeinput(state,currentinput){
      this.state.currentinput = currentinput
    },
    changestatus(state,status){
      this.state.status = status
    },
    changestateinput(state,stateinput){
        this.state.stateinput = stateinput
    },
    changesearchkeys(state,searchkey){
      this.state.searchkey = searchkey
  }
    
  },
  actions: {
    sendmap(context, map) {
      context.commit('changemap', map)
    }
  }
})

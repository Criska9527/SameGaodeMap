<template>
  <div class="ParContent">
    <div class="Search">
      <div class="search-item">
        <img :src="imgurl" alt="">
        <el-input v-model="input" placeholder="搜索位置，公交站，地铁" class="search-input" @focus="showdiv"></el-input>
        <div class="searchbtn iconfont iconsousuo1" @click="search">
            <!-- <i class="iconfont iconsousuo1"></i> -->
        </div>
        <div class="search-road-btn iconfont iconroute">
            
        </div>
      </div>
    </div>
     <transition name="searchRec">
    <div class="Recomment" v-show="recommendstatus">
        <ul>
            <li v-for="(item,index) in recommend" :key="index" @click="getkeywords(item.title)"  class="Recomment-li">
                <img :src="item.url" :name="item.title">
                <div class="title">
                    {{item.title}}
                </div>
            </li>
        </ul>
    </div>
     </transition>
    <transition name="searchRes">
        <search-res v-if="searchRes"  ref="searchres"></search-res>
    </transition>
  </div>
</template>
<script>
import {mapconfig} from '../assets/config/mapconfig'
import SearchRes from '@/components/SearchRes.vue'
export default {
  name:'Search',
  data() {
    return {
      input: "",
      imgurl:`${process.env.BASE_URL}images/default.png`,
      recommend:[
          {
              url:'https://a.amap.com/pc/static/img/search_food.png',
              title:'美食'
          },
          {
              url:'https://a.amap.com/pc/static/img/search_hotel.png',
              title:'酒店' 
          },
          {
              url:'https://a.amap.com/pc/static/img/search_view.png',
              title:'景点' 
          },
          {
              url:'https://a.amap.com/pc/static/img/search_house.png',
              title:'小区'
          }
      ],
      recommendstatus:false,
      searchRes:false,
      renderstatus:true //判断是不是在结果渲染状态
    };
  },
  computed:{
    currentinput:{
      get(){
        //this.input = this.currentinput
        return this.$store.state.currentinput
      }
    }
  },
  methods:{
      showdiv(){
        if(this.renderstatus)
         this.recommendstatus = true
         this.renderstatus = false
      },
      test(){
        //alert(888)
        
        // console.log(this.$refs.sss.value)
          this.$store.commit('changeinput',this.$refs.sss.value)
      },
      search(){
        this.$store.commit('changesearchkeys',this.input)
        //this.$refs.searchres.search(this.input)
          this.searchRes = true
       //console.log(this.$refs.searchres)
      
        this.recommendstatus = false
      },
      // recommendclick(e){
      //   //alert(this.$refs.reli.innerText)
      //   //console.log(e.target.tagName)
      //   //判断dom类型
      //   if(e.target.tagName==='IMG'){
      //       console.log(e.target.name)
      //   }else{
      //       console.log(e.target.innerText)
      //   }
      // },
      getkeywords(keywords){
          this.$store.commit('changekeywords',keywords)
          this.$store.commit('changeinput',keywords)
          //this.input = this.currentinput
          this.searchRes = true
          this.recommendstatus = false
      }
  },
  mounted(){
     //this.input = this.currentinput
  },
  components:{
    SearchRes
  }
};
</script>
<style lang="stylus" scoped>
@import '~styles/varibles.styl'
@import '~styles/mixins.styl'
@import '~styles/search.css'
.ParContent
     defaultdiv()
     left: .24rem;
     top: 13px;
     .search-item
        display:flex
        .search-input
            padding-right:10px
        .searchbtn
            margin-left: -36px;
            z-index: 50;
            line-height: 40px;
            color: #6d6767;
            font-weight:bold
        img
             height: 30px;
             width: 30px;
             margin-right: -32px;
             z-index: 30;
             margin-top: 4px;
        .search-road-btn
             z-index:10
             margin-left: 12px;
             font-size: 26px;
             line-height: 41px;
             color: #42a5f5;
             background:#f8f8f8;
             padding:0 10px
            
        
</style>
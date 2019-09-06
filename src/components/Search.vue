<template>
  <div class="ParContent">
    <div class="Search">
      <div class="search-item">
        <img :src="imgurl" alt="">
        <el-input v-model="input" placeholder="搜索位置，公交站，地铁" class="search-input" @focus="showdiv"></el-input>
        <div class="searchbtn iconfont iconsousuo1">
            <!-- <i class="iconfont iconsousuo1"></i> -->
        </div>
        <div class="search-road-btn iconfont iconroute">
            
        </div>
      </div>
    </div>
    <div class="Recomment" v-show="recommendstatus">
        <ul>
            <li v-for="(item,index) in recommend" :key="index" @click="recommendclick" ref="reli" class="Recomment-li">
                <img :src="item.url" alt="">
                <div class="title">
                    {{item.title}}
                </div>
            </li>
        </ul>
    </div>
  </div>
</template>
<script>
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
      recommendstatus:false
    };
  },
  methods:{
      showdiv(){
         this.recommendstatus = true
      },
      recommendclick(){
          //this.$refs.
      }
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
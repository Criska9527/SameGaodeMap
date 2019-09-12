<template>
        <div class="content">
            <header class="photoshow">
                <div class="back">
                  <el-button-group>
                    <el-button  icon="el-icon-arrow-left" size="mini" @click="back">返回</el-button>
                  </el-button-group>
                </div>
                <el-carousel height="150px">
                  <el-carousel-item v-for="(item,index) in selectitem.photos" :key="index">
                      <img :src="item.url" alt="" class="imgs">
                   </el-carousel-item>
                </el-carousel>
            </header>
            <Main>
                <div class="main-content">
                        <div class="name">
                          {{selectitem.name}}
                        </div>
                          
                        <div class="rate">
                             <el-rate
                                 v-model="selectitem.biz_ext.rating"
                                 disabled
                                 show-score
                                 text-color="#ff9900"
                              >
                             </el-rate>
                        </div>
                         <div class="typecost">
                            <span class="cost">{{selectitem.biz_ext.cost|costformmat}}</span>
                        </div>

                         <div class="address">
                           <span class="el-icon-location"></span>
                            {{selectitem.address}}
                         </div>
                         <div class="Tel">
                           <span class="el-icon-phone"></span>
                            {{selectitem.tel}}
                         </div>
                </div>
            </Main>
            <div class="bottom">
               <ul>
                 <li>
                   <span class="el-icon-star-on"></span>
                   收藏
                 </li>
                 <li>
                    <span class="el-icon-star-on"></span>
                    搜周边
                 </li>
               </ul>
            </div>
        </div>
</template>
<script>
import {mapconfig} from '../assets/config/mapconfig'
import SearchRes from '@/components/SearchRes.vue'
export default {
  name:'PoiDetail',
   props: {
    selectitem: {

     }
   },
   watch:{
        selectitem(){
             this.selectitem = this.selectitem
              this.$store.commit('changeinput',this.selectitem.name)
             //console.log(this.currentinput)
             //this.$store.commit('changecity',this.currentcity)
        }
    },
  computed:{
      currentinput:{
        get(){
           return this.$store.state.currentinput
        },
        set(){
          
        }
      },
      status:{
        get(){
           return this.$store.state.status
        },
      }
    },
     filters:{
        costformmat(cost){
            if(cost){
                return `¥${cost}`
            }else{
                return ''
            }
        },
        typeformat(type){
            let arr = type.split(";")
            //console.log(arr[arr.length-1])
            return arr[arr.length-1]
        },
        typefilter(type){
             let arr = type.split(";")
              return arr[arr.length-2]
        }   

    },
   mounted(){
     
     //this.currentinput = this.selectitem.name
     //console.log(this.currentinput)
   },
   methods:{
     back(){  
      this.status.listshow = true
      this.status.detailshow = false
        //  this.listshow = true
        // this.detailshow = false
     }
   }
};
</script>
<style lang="stylus" scoped>
@import '~styles/varibles.styl'
@import '~styles/mixins.styl'
@import '~styles/poidetail.css'
.content
  defaultdiv()
  background #fff
  left: 0px;
  top: 43px;
  width: 100%;
  font-size:12px
  header
    color:red
    img
      height 100%
      width 100%
  Main
    border 1px solid #eee
    text-align left
    .main-content
      padding:10px
      .name
        font-size:16px
      .typecost
        .cost
          color:red
      .address
        padding:5px 0px
        color:#333;
        span
          font-size 16px
          margin-right 5px
      .Tel
        color:#333;
        span
          font-size 16px
          margin-right 5px
  .bottom
    ul
      display flex
      height 100%
      font-size 14px
      cursor pointer
      li
        flex-grow 1
        padding 8px 0
        color #077ad6

    
        
</style>
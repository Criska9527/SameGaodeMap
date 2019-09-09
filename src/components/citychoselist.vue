<template>
<div class="Pcontent">
    <div class="city-panel">
        <header class="city-header">
            <span class="city-current">当前城市:{{currentcity}}</span>
        </header>
        <div class="search">
            <el-autocomplete
                popper-class="my-autocomplete"
                v-model="state"
                :fetch-suggestions="querySearch"
                placeholder="请输入内容"
                @select="handleSelect">
                 <i
                    class="el-icon-edit el-input__icon"
                    slot="suffix"
                    @click="handleIconClick">
                 </i>
                <template slot-scope="{ item }">
                    <div class="name">{{ item.name }}</div>
                 </template>
            </el-autocomplete>
        </div>
        <ul class="city-hotlist">
            <li 
                adcode="1" 
                v-for = "(item,key) in hotcitylist" 
                :key="key"
                @click="gotocity(item.name)"
            >
                {{item.name}}
            </li>
        </ul>
        <div class="citytab">
            <div class="tab">
                <el-tabs v-model="activeName" @tab-click="handleClick">
                    <el-tab-pane label="按省份" name="first">
                        <ul class="city-province-letter">
                            <li 
                                v-for = "(item,key) in provinceletter" 
                                :key="key"
                                @click="cityScroll(item)" 
                            >
                                {{item}}
                            </li>
                        </ul>
                            <div class="city-city wrapper">
                                <div class="content">
                                    <dl>
                                        <div v-for = "(item,key) in citylist" :key="key" class="content-item">
                                            <dt :class="item.code" :data-letter="item.code">{{item.name}}:</dt>
                                            <dd>
                                                <li 
                                                  adcode="340100"
                                                  v-for = "(sonitem,sonkey) in item.children" 
                                                  :key="sonkey"
                                                   @click="gotocity(sonitem.name)"
                                                >
                                                {{sonitem.name}}
                                             
                                                </li>
                                            </dd>
                                        </div>
                                 
                                    </dl>
                                    
                                </div>
                            </div>
                    </el-tab-pane>
                    <el-tab-pane label="按城市" name="second">
                        功能正在开发中
                    </el-tab-pane>
                </el-tabs>
            </div>


        </div>
    </div>  
</div>
      
</template>
<script>
import BScroll from 'better-scroll'
import { transform } from 'ol/proj'
export default {
    name:'CityChoseList',
     data() {
      return {
        activeName: 'first',
        allcitys: [],
        state: '',
        citylist:[],//保存所有城市
        provinceletter:[], //省份首字母
        hotcitylist:[],
        currentcity:'',
        scroll:''
      };
    },
   props: {
    currentcitys: {
      type: String
     }
   },
    computed:{
        map:{
            get(){
                return this.$store.state.map
            }
        }
    },
    watch:{
        currentcitys(){
             this.currentcity = this.currentcitys
             this.$store.commit('changecity',this.currentcity)
        }
    },
     methods: {
      //获取城市数据
      getcitydata(){
          const publicPath = process.env.BASE_URL
          this.$axios.get(`${publicPath}json/city.json`).then((res)=>{
              const data = res.data
              let letterArr = new Array()
              let cityArr = new Array()
               let set = null
              for(let item of data){
                 cityArr.push(item)
                    if(item.children){
                     for(let sonitem of item.children){
                         this.allcitys.push(sonitem)
                     }
                    }
                 letterArr.push(item.code)
                 //使用set去重
                 set = new Set(letterArr);
                 if(item.hotcity){
                      this.hotcitylist = item.hotcity
                 }             
              }
              //cityArr.sort(this.compare)
              cityArr.sort(function(a,b){
                  if(a.code && b.code){
                    return a.code.localeCompare(b.code)
                  }
               

                })
              //console.log(cityArr)
               this.citylist = cityArr
               //set变为数组，排序并赋值给this.provinceletter
              let arr =  Array.from(set).sort()
              this.provinceletter = arr
              //console.log(this.hotcitylist)
            
          })
      },
      compare (val1,val2){
        if(val1.code&&val2.code){
               //console.log(val1.code.toLowerCase(),val2.code.toLowerCase())
            return val1.code.toLowerCase()> val2.code.toLowerCase();
        }
     
        //
    },
      //定位城市
      gotocity(cityname){
          const map = this.map
          let clickcity = null
          //console.log(this.citylist)
          for(let item of this.citylist){
            if(item.children){
                for(let sonitem of item.children){
                    console.log(sonitem.name)
                

                        if(sonitem.name === cityname){
                           clickcity =  sonitem
                        }
                  

                }
            }
           
          }
          console.log(clickcity)
          this.currentcity = cityname
         //将当前城市传递给父组件
          this.$emit('currentcity',cityname)
        //   //选择城市的经纬度
         
          if(cityname==="全国"){
              map.getView().setZoom(3)
          }else{
               const cooridate = [Number(clickcity.log),Number(clickcity.lat)]
                console.log(cooridate)
                //定位
                console.log(transform(cooridate, 'EPSG:4326', 'EPSG:3857'))
              map.getView().setCenter(transform(cooridate, 'EPSG:4326', 'EPSG:3857'))
              map.getView().setZoom(10)
          }  
            // var innerbox = document.querySelector('.G');
            // console.log(innerbox.offsetTop)
            // // innerbox.offsetTop = 28
            // this.scroll.scrollToElement(innerbox,300,true,true)
          
      },
      cityScroll(el){
        this.scroll.refresh() 
        let innerbox = document.querySelector(`.${el}`);
        //innerbox
        this.scroll.scrollToElement(innerbox,800,true,0)
      },
      //搜索框聚焦时触发
      querySearch(queryString, cb) {
        
        var allcitys = this.allcitys;
         var filtercitys = allcitys.filter((res)=>{
             if((res.name).includes(queryString)){
                 return res
             }
         })
        var results = queryString ? filtercitys : '';
       
        // 调用 callback 返回建议列表的数据
        cb(results);
      },
      handleSelect(item) {
         this.gotocity(item.name)
      },
      handleIconClick(ev) {
          debugger
        console.log(ev);
      },
      handleClick(tab, event) {
          debugger
        console.log(tab, event);
      }
    },
    mounted() {
      this.scroll = new BScroll('.wrapper',{
            scrollY: true,
            click: true
      })
      this.getcitydata()
      //console.log(this.currentcitys)
    }
 

}
</script>>
<style lang="stylus" scoped>
@import '~styles/choselist.css'
.Pcontent
    width:8.4rem
    height:6rem
    padding: 6px 15px 15px;
    .city-header
        line-height: .72rem;
        font-size: .28rem;
        font-weight: 700;
        border-bottom: 1px solid #cbcccd;
        color: #5f6477;
    .city-panel
        font-size:.28rem
        ul
            li
                list-style:none
        .city-hotlist
            display:flex
            flex-wrap:wrap
            font-size:.24rem
            margin-top: .1rem;
            margin-bottom: .12rem;
            li
                margin-right: .2rem;
                color: #42a5f5;
                cursor: pointer;
                line-height: .52rem;
        .search
            position:absolute
            left:4.36rem
            top:2.42rem
            z-index:20
        .citytab
            .city-province-letter
                display:flex
                flex-wrap:wrap
                margin-bottom:10px
                
                li
                    margin-left: .12rem;
                    cursor: pointer;
                    line-height: .36rem;
                    width: .365rem;
                    text-align: center;
                    background-color: #F5F5F5;
                    font-size:.24rem
            .city-city
                width: 100%;
                height:2.8rem
                font-size:.24rem
                overflow:auto
                dl  
                    margin-top:0 
                    .content-item
                        margin-bottom:8px
                        dt
                            float:left
                            color: #5f6477 !important
                            height: 20px;
                            line-height: 20px;
                        dd
                            display:flex
                            flex-wrap:wrap
                            font-size:.24rem
                            li
                                margin-right: .18rem
                                cursor: pointer
                                color: #999
                                line-height: 20px;
</style>
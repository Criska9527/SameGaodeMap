<template>
  <div class="parcontent">
    <div class="list" v-show="status.listshow">
      <header>
      <li class="addresschose">
        <el-dropdown trigger="click" placement="bottom" @visible-change="getgov">
          <el-button type="primary" size="mini"> 
            {{currentgov}}
            <i class="el-icon-arrow-down el-icon--right"></i>
          </el-button>
          <el-dropdown-menu slot="dropdown" class="addressmenu">
            <el-dropdown-item   @click.native="fitergov('全城')">全城</el-dropdown-item>
            <el-dropdown-item 
                v-for="(item,index) in govlist"
                :key="index"
                @click.native="fitergov(item.name,item.adcode)"
            >
            {{item.name}}    
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </li>
      <li class="typechose">
          <el-dropdown trigger="click" placement="bottom"  @visible-change="gettype()">
          <el-button type="primary" size="mini"> 
            全部分类
            <i class="el-icon-arrow-down el-icon--right"></i>
          </el-button>
          <el-dropdown-menu slot="dropdown" class="typemenu">
              <div class="content">
                   <!-- <dl>
                       <li>
                            <dt>全部分类</dt>
                            <dd>
                                <ul>
                                    <li>全部</li>
                                </ul>
                            </dd>
                       </li>
                       <li  
                            v-for="(item,index) in searchlist"
                            :key="index"
                        >
                          <dt>{{item.type|typefilter}}</dt>
                            <dd>
                                <ul>
                                    <li>全部</li>
                                </ul>
                            </dd> 
                       </li>
                   
                   </dl> -->
                   数据不齐全,功能暂不开发
              </div>
          </el-dropdown-menu>
         </el-dropdown>
      </li>
        <li class="recomchose">
          <el-dropdown trigger="click" placement="bottom">
          <el-button type="primary" size="mini"> 
            {{currentpriority}}
            <i class="el-icon-arrow-down el-icon--right"></i>
          </el-button>
          <el-dropdown-menu slot="dropdown" class="recommentmenu">
            <el-dropdown-item 
                v-for="(item,index) in prioritylist"
                :key="index"
                @click.native="filterpor(item)"
            
            >
            {{item}}
            </el-dropdown-item>
          </el-dropdown-menu>
         </el-dropdown>
      </li> 
    </header>
    <div class="middle">
        <div class="content">
            <ul>
                <li  
                    v-for="(item,index) in searchlist"
                    :key="index"
                    @click="poidetails(item)" 
                 >
                    <div class="left baseinfo">
                        <div class="name">
                           {{index+1}}.{{item.name}}
                        </div>
                        <div class="range"></div>
                        <div class="typecost">
                            <span class="type">{{item.type|typeformat}}</span>
                            <span class="cost">{{item.biz_ext.cost|costformmat}}</span>
                        </div>
                        <div class="rate">
                            <el-rate
                                v-model="item.biz_ext.rating"
                                disabled
                                show-score
                                text-color="#ff9900"
                             >
                            </el-rate>
                        </div>
                        <div class="address">
                            {{item.address}}
                        </div>
                    </div>
                    <div class="right photo">
                        <img :src="item.photos[0].url" alt="">
                    </div>
                </li>
            </ul>
        </div>
    </div>
    <div class="bottom">
        <el-pagination
          small
          layout="prev, pager, next"
          :total="count"
          :page-size="20"
          @current-change="handleCurrentChange"
        >
        </el-pagination>
    </div>
    </div>
    <transition name="detail">
        <poi-detail v-show="status.detailshow" :selectitem = "selectitem"></poi-detail>
    </transition>

  </div>
</template>
<script>
import { mapconfig } from "../assets/config/mapconfig";
import conmonMethods from '../assets/js/commonMethods'
import TileLayer from 'ol/layer/Tile';
import { transform } from 'ol/proj'
import { OSM, TileArcGISRest, WMTS } from 'ol/source.js';
import Feature from 'ol/Feature.js';
import Point from 'ol/geom/Point.js';
import VectorLayer from 'ol/layer/Vector.js';
import VectorSource from 'ol/source/Vector.js';
//import { AtlasManager,Icon, Style, Circle as CircleStyle, Fill, Stroke,RegularShape,Stroke } from 'ol/style.js';
import PoiDetail from '@/components/PoiDetail.vue'




   import {AtlasManager, Circle as CircleStyle, Fill, RegularShape, Stroke, Style} from 'ol/style.js';

export default {
  name: "SearchRes",
  data(){
      return{
          govlist:[],
          currentgov:'全城',
          page:1,
          currentpriority:'推荐排序',
          prioritylist:[
              '推荐排序',
              '距离优先' ,
              '高性价比优先',
              '好评优先',
              '低价优先'
          ],
          searchlist:[],
          orisearchlist:[],
          count:10 ,//总数量
          typelist:[],
          publicPath: process.env.BASE_URL,
          selectitem:'',
          keyword:''
      }
  },
  watch:{
      page(){
         this.searchlist = []
         this.search() 
      },
      searchlist(){
        this.addPoint(this.keyword)
      },
      searchkey(){
         this.searchlist = []
         this.search() 

      }

  },
  computed: {
    keywords: {
      get() {
        return this.$store.state.keywords;
      }
    },
    currentcity: {
      get() {
        return this.$store.state.currentcity;
      }
    },
    map:{
      get(){
         return this.$store.state.map;
      }
    },
    status:{
      get(){
        return this.$store.state.status;
      }
    },
    searchkey:{
      get(){
        return this.$store.state.searchkey;
      }
    }
  },
  mounted() {
    this.search();
  },
  methods: {
    //查询所在区域的数据
    search() {
      debugger
      var keywords = ''
      const publicPath = this.publicPath
      if(this.searchkey!=''){
        this.keyword = this.searchkey
      }else{
         this.keyword = this.keywords
      }
      this.$axios
        .get(mapconfig.SearchUrl, {
          params: {
            keywords:  this.keyword,
            city: this.currentcity,
            key: mapconfig.AmapServeKey,
            extensions: "all",
            page:this.page
          }
        })
        .then(res => {
          if (res.statusText === "OK") {
            const data = res.data;
            console.log(res)
            this.count = Number(data.count)
         
            if(this.origincount){
                 this.origincount =  Number(data.count)
            }else{
               this.origincount =0
            }
            
            //this.searchlist = data.pois
            for(let item of  data.pois){
                // if(item.bizext.rating){
                //     Number(item.bizext.rating)
                // }
               
               item.biz_ext.rating = Number(item.biz_ext.rating)
               item.location.split(',')
               item.lon = Number(item.location.split(',')[0])
               item.lat = Number(item.location.split(',')[1])
               if(typeof(item.biz_ext.rating) == undefined){
                    item.biz_ext.rating  = 0
               }
               if(item.photos.length<=0){
                 item.photos.push(
                   {
                       url:`${publicPath}images/default.png`
                   }
                 
                 )
                 console.log(item.photos[0])
               }
              
               this.searchlist.push(item)
            }
            this.orisearchlist = this.searchlist
            
            console.log(this.searchlist)
            
            
          }
        });
    },
    searchall(){
        this.$axios.get(mapconfig.SearchUrl,{
          params: {
            keywords: this.keywords,
            city: this.currentcity,
            key: mapconfig.AmapServeKey,
            extensions: "all",
            offset:this.origincount
          }
    
        }).then((res)=>{
            console.log(res)
        })
    },
    render(){

    },
    //获取城市的行政区划
    getgov(){
        this.$axios
        .get(mapconfig.GovUrl, {
          params: {
            keywords: this.currentcity,
            subdistrict: 1,
            key: mapconfig.AmapServeKey,
          }
        })
        .then(res => {
          if (res.statusText === "OK") {
            const data = res.data;
            console.log(data.districts[0].districts);
            this.govlist = data.districts[0].districts
          }
        });
    },
    //行政区划点击事件
    fitergov(name,code){
        //this.search()
        this.searchlist = this.orisearchlist
        this.currentgov = name
        if(this.currentgov==='全城'){
            this.searchlist = this.orisearchlist
            this.count = this.origincount
        }else{
            this.searchlist = this.searchlist.filter((item)=>{
                if(item.adcode===code){
                    return item
                }
            })
            this.count =  this.searchlist.length
        }
        console.log(this.currentgov)
      
    },
    //类型的获取
    gettype(){
        return
        let obj = {
            

        }
        let partype = null
        let sontype = null
        let arr = null
        let counts = Math.ceil(this.origincount/20)
        console.log(counts)
        for(let i=0;i<counts;i++){
            //console.log(i)
            this.$axios.get(mapconfig.SearchUrl,{
                params: {
                    keywords: this.keywords,
                    city: this.currentcity,
                    key: mapconfig.AmapServeKey,
                    extensions: "all",
                    page:i+1
             }
    
            }).then((res)=>{
                for(let item of res.data.pois){
                     arr = item.type.split(";")
                     //console.log(arr)
                    //  partype = arr[length-2]
                    //  sontype = arr[length-1]
                     obj = {
                        partype:arr[arr.length-2],
                        sontype: arr[arr.length-1]
                    }
                    this.typelist.push(obj)
                }
                   
               
            })
           
        }

      console.log(this.typelist)
      let object = {};
      let objres = this.typelist.reduce((item,next) => {
            console.log("item is ",item);
            object[next.partype] ? "" : object[next.partype] = true && item.push(next);
             return item;
      },[]);
      console.log(objres)

      
      
       
    },
    //优先级筛选
    filterpor(type){
          this.currentpriority = type
    },
    //页码改变事件
    handleCurrentChange(val) {
        this.page = val
    },
    addPoint(layertype) {

        const map = this.map
        const publicPath = this.publicPath
        //数据处理
        //当数据存在时，对其进行处理
        let feature, geometry, iconurl, iconsize;
        let features = []
        //样式处理
        if (layertype == '美食') {
            //餐饮站点
            //图标地址
            iconurl = `${publicPath}images/dinner-point.png`
            iconsize = [24, 24]
        } else if (layertype == '酒店') {
            //污染源站点
            iconurl =  `${publicPath}images/hotel-point.png`
            iconsize = [24, 24]
        } else if(layertype == '景点'){
            //默认设置
            iconurl = `${publicPath}images/旅游景点.png`
            iconsize = [18, 25]
        }else if(layertype == '景点'){
            //默认设置
            iconurl = `${publicPath}images/居民小区村庄.png`
            iconsize = [18, 25]
        }
        else{
          // var s = {
            
          // }
           var a = new CircleStyle({
            opacity:1.0,
            scale: 1.0,
            radius:10,
            fill: new Fill({
              color:  'rgba(255, 153, 0, 0.4)'
            }),
            stroke: new Stroke({
              color: 'rgba(255, 204, 0, 0.2)',
              width: 20
            })
            // by passing the atlas manager to the symbol,
            // the symbol will be added to an atlas
         
          })
           //默认设置
            iconurl = `${this.publicPath}images/point_red_small.png`
            iconsize = [20, 32]
        }
        let iconStyle = new Style({
            image: a
        });
        for (let item of this.searchlist) {
            //新建点要素
            geometry = new Point(transform([item.lon, item.lat], 'EPSG:4326', 'EPSG:3857'), "XY")
           // geometry = new Point([item.lon, item.lat])
            feature = new Feature(geometry);
            //给feature赋予属性
            feature.setProperties(item)
            //设置点位样式
            feature.setStyle(iconStyle);
            //将点位依次传入数据容器
            features.push(feature)

        }
        //新建数据源
        const vectorSource = new VectorSource({
            features: features
        });
        //更新图层的数据并重新渲染
        //判断是否存在VectorLayer，存在则清空所有该图层数据源，并重新渲染


        //获取所有的图层
        const maplayers = map.getLayers()

        console.log(maplayers)

        let vector =  conmonMethods.getWantedLayer('pointlayer',map)
        
        console.log(vector)

        if (vector) {
            map.removeLayer(vector)   
        } 
            //不存在的时候创建新图层

            vector = new VectorLayer({
                name: 'pointlayer',
                source: vectorSource
            })
            //在地图上添加此图层
            map.addLayer(vector)
            //this.$store.dispatch('sendmap',this.map)
        
        console.log(map.getLayers())

    },
    poidetail(id){
        this.$router.push({
                path: `/${id}`
        })
    },
    poidetails(item){
      this.selectitem = item
      
      this.status.listshow = false
      this.status.detailshow = true
      


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
    components:{
      PoiDetail
    }

};
</script>
<style lang="stylus" scoped>
@import '~styles/varibles.styl'
@import '~styles/mixins.styl'
@import '~styles/searchres.css'
    .parcontent
        background:#fff
        cursor pointer
        header
            margin-top: -25px
            padding: 7px;
            display:flex
            justify-content:space-around
            li
                padding-left:2px
        .middle        
            font-size:12px;
            color:#b3adad
            height: 458px;
            overflow: hidden;
            overflow-y:auto
            .content
                padding:14px
                ul
                    li
                        display:flex
                        text-align:left
                        padding: 15px 0;
                        .baseinfo
                            div
                                margin-bottom:3px
                            .name
                                font-size 14px
                                font-weight:bold
                                color:#615b5b
                            width: 156px;
                            margin-right:10px
                            .typecost
                                .cost
                                    color:red
                                    margin-left:7px;
                        .photo
                            img
                                width: 110px;
                                height: 100px;
        .bottom
            height: 36px;
            margin-top: 21px;


          

</style>
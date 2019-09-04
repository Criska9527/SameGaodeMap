<template>
  <div class="cityChange">
      <ul>
        <li class="citychose">
              <el-dropdown type="primary">
                  <span class="el-dropdown-link">
                  {{city}}
                  <i class="el-icon-arrow-down el-icon--right"></i>
                  </span>
                   <el-dropdown-menu slot="dropdown">
                        城市选择
                  </el-dropdown-menu>
              </el-dropdown>
        </li>
        <li class="weather">
            <span class="weature">
                {{weature}} /
            </span>
            <span class="tempture">
                {{temperature}}℃
            </span>
        </li>
     </ul>
  </div>
</template>

<script>
import { transform } from 'ol/proj'
import {mapconfig} from '../assets/config/mapconfig'
export default {
    name:'CityChose',
    data(){
        return{
            center:'',
            city:'',
            cityadccode:'',
            weature:'',
            temperature:''
        }
    },
    watch:{
        cityadccode(){
            //天气查询
            this.GetWeature()
        }
    },
    computed:{
       map:{
           get(){
                 return this.$store.state.map
           }
          
       }
    },
    mounted(){
        //设置延时确保可以获取到map
        setTimeout(()=>{
             console.log(this.map)
             const center = transform(this.map.getView().getCenter(), 'EPSG:3857', 'EPSG:4326')
             this.center = center.join(",");
             this.InverseGeo()
        },500)
       
        //this.center = transform(this.map.getView().getCenter(), 'EPSG:3857', 'EPSG:4326')
      
    },
    methods:{
        //逆地址解析获取当前城市
        InverseGeo(){
            const url = mapconfig.InverseGeoUrl
            this.$axios.get(url,{
                params:{
                    key:mapconfig.AmapServeKey,
                    location:this.center
                }
            }).then((res)=>{
                console.log(res)
                if(res.statusText==='OK'){
                    const data = res.data
                    //城市的名字
                    this.city = data.regeocode.addressComponent.city
                    //城市的编码
                    this.cityadccode =  data.regeocode.addressComponent.adcode
                    
                }
            })
        },
        //天气查询
        GetWeature(){
            this.$axios.get(mapconfig.GetWeatureUrl,{
                params:{
                    key:mapconfig.AmapServeKey,
                    city:this.cityadccode
                }
            }).then((res)=>{
                if(res.statusText==="OK"){
                    const data = res.data.lives[0]
                    this.weature = data.weather
                    this.temperature =data.temperature
                }
            })
        }
    }

}
</script>


<style lang="stylus" scoped>
@import '~styles/varibles.styl'
@import '~styles/mixins.styl'
.cityChange
  defaultdiv()
  top: 0.32rem;
  left: 8rem;
  font-size: 0.28rem;
  background: #fff;
  border:none;
  ul
    margin:0
    padding:0
    display: flex;
    flex-direction: row;
    li
        display:inline-block
        padding:.16rem
    .citychose   
        font-weight:bold 
    .citychose:hover
        color:blue
    .weather
        padding-left: 0;
</style>
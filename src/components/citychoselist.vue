<template>
<div class="Pcontent">
    <div class="city-panel">
        <header class="city-header">
            <span class="city-current">当前城市:郑州</span>
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
                    <div class="name">{{ item.value }}</div>
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
                            <li v-for = "(item,key) in provinceletter" :key="key">
                                {{item}}
                            </li>
                        </ul>
                            <div class="city-city wrapper">
                                <div class="content">
                                    <dl>
                                        <div v-for = "(item,key) in citylist" :key="key" class="content-item">
                                            <dt class="index-A">{{item.name}}：</dt>
                                            <dd>
                                                <li 
                                                  adcode="340100"
                                                  v-for = "(sonitem,sonkey) in item.children" 
                                                  :key="sonkey"
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
        restaurants: [],
        state: '',
        citylist:[],//保存所有城市
        provinceletter:[], //省份首字母
        hotcitylist:[]
      };
    },
    computed:{
        map:{
            get(){
                return this.$store.state.map
            }
        }
    },
     methods: {
      //获取城市数据
      getcitydata(){
          const publicPath = process.env.BASE_URL
          this.$axios.get(`${publicPath}json/city.json`).then((res)=>{
              const data = res.data
              let letterArr = new Array()
               let set = null
              for(let item of data){
                 this.citylist.push(item)
                 letterArr.push(item.code)
                 //使用set去重
                 set = new Set(letterArr);
                 if(item.hotcity){
                      this.hotcitylist = item.hotcity
                 }
                
                 //Array.from(set)
                 //给字母排序并赋值给this.provinceletter
                 //this.provinceletter.push(Array.from(set).sort())
                
              }
               
               //set变为数组，排序并赋值给this.provinceletter
              let arr =  Array.from(set).sort()
              this.provinceletter = arr
              console.log(this.hotcitylist)
            
          })
      },
      //定位城市
      gotocity(cityname){
          const map = this.map
          const clickcity = this.hotcitylist.filter((item)=>{
              if(item.name === cityname){
                  return item
              }
          })
          //选择城市的经纬度
          const cooridate = [Number(clickcity[0].log),Number(clickcity[0].lat)]
          console.log(cooridate)
          //定位
        
          console.log(transform(cooridate, 'EPSG:4326', 'EPSG:3857'))
          map.getView().setCenter(transform(cooridate, 'EPSG:4326', 'EPSG:3857'))
          map.getView().setZoom(10)
          
      },
      querySearch(queryString, cb) {
        var restaurants = this.restaurants;
        var results = queryString ? restaurants.filter(this.createFilter(queryString)) : restaurants;
        // 调用 callback 返回建议列表的数据
        cb(results);
      },
      createFilter(queryString) {
        return (restaurant) => {
          return (restaurant.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0);
        };
      },
      loadAll() {
        return [
          { "value": "三全鲜食（北新泾店）", "address": "长宁区新渔路144号" },
          { "value": "Hot honey 首尔炸鸡（仙霞路）", "address": "上海市长宁区淞虹路661号" },
          { "value": "新旺角茶餐厅", "address": "上海市普陀区真北路988号创邑金沙谷6号楼113" },
          { "value": "泷千家(天山西路店)", "address": "天山西路438号" },
          { "value": "胖仙女纸杯蛋糕（上海凌空店）", "address": "上海市长宁区金钟路968号1幢18号楼一层商铺18-101" },
          { "value": "贡茶", "address": "上海市长宁区金钟路633号" },
          { "value": "豪大大香鸡排超级奶爸", "address": "上海市嘉定区曹安公路曹安路1685号" },
          { "value": "茶芝兰（奶茶，手抓饼）", "address": "上海市普陀区同普路1435号" },
          { "value": "十二泷町", "address": "上海市北翟路1444弄81号B幢-107" },
          { "value": "星移浓缩咖啡", "address": "上海市嘉定区新郁路817号" },
          { "value": "阿姨奶茶/豪大大", "address": "嘉定区曹安路1611号" },
          { "value": "新麦甜四季甜品炸鸡", "address": "嘉定区曹安公路2383弄55号" },
          { "value": "Monica摩托主题咖啡店", "address": "嘉定区江桥镇曹安公路2409号1F，2383弄62号1F" },
          { "value": "浮生若茶（凌空soho店）", "address": "上海长宁区金钟路968号9号楼地下一层" },
          { "value": "NONO JUICE  鲜榨果汁", "address": "上海市长宁区天山西路119号" },
          { "value": "CoCo都可(北新泾店）", "address": "上海市长宁区仙霞西路" },
          { "value": "快乐柠檬（神州智慧店）", "address": "上海市长宁区天山西路567号1层R117号店铺" },
          { "value": "Merci Paul cafe", "address": "上海市普陀区光复西路丹巴路28弄6号楼819" },
          { "value": "猫山王（西郊百联店）", "address": "上海市长宁区仙霞西路88号第一层G05-F01-1-306" },
          { "value": "枪会山", "address": "上海市普陀区棕榈路" },
          { "value": "纵食", "address": "元丰天山花园(东门) 双流路267号" },
          { "value": "钱记", "address": "上海市长宁区天山西路" },
          { "value": "壹杯加", "address": "上海市长宁区通协路" },
          { "value": "唦哇嘀咖", "address": "上海市长宁区新泾镇金钟路999号2幢（B幢）第01层第1-02A单元" },
          { "value": "爱茜茜里(西郊百联)", "address": "长宁区仙霞西路88号1305室" },
          { "value": "爱茜茜里(近铁广场)", "address": "上海市普陀区真北路818号近铁城市广场北区地下二楼N-B2-O2-C商铺" },
          { "value": "鲜果榨汁（金沙江路和美广店）", "address": "普陀区金沙江路2239号金沙和美广场B1-10-6" },
          { "value": "开心丽果（缤谷店）", "address": "上海市长宁区威宁路天山路341号" },
          { "value": "超级鸡车（丰庄路店）", "address": "上海市嘉定区丰庄路240号" },
          { "value": "妙生活果园（北新泾店）", "address": "长宁区新渔路144号" },
          { "value": "香宜度麻辣香锅", "address": "长宁区淞虹路148号" },
          { "value": "凡仔汉堡（老真北路店）", "address": "上海市普陀区老真北路160号" },
          { "value": "港式小铺", "address": "上海市长宁区金钟路968号15楼15-105室" },
          { "value": "蜀香源麻辣香锅（剑河路店）", "address": "剑河路443-1" },
          { "value": "北京饺子馆", "address": "长宁区北新泾街道天山西路490-1号" },
          { "value": "饭典*新简餐（凌空SOHO店）", "address": "上海市长宁区金钟路968号9号楼地下一层9-83室" },
          { "value": "焦耳·川式快餐（金钟路店）", "address": "上海市金钟路633号地下一层甲部" },
          { "value": "动力鸡车", "address": "长宁区仙霞西路299弄3号101B" },
          { "value": "浏阳蒸菜", "address": "天山西路430号" },
          { "value": "四海游龙（天山西路店）", "address": "上海市长宁区天山西路" },
          { "value": "樱花食堂（凌空店）", "address": "上海市长宁区金钟路968号15楼15-105室" },
          { "value": "壹分米客家传统调制米粉(天山店)", "address": "天山西路428号" },
          { "value": "福荣祥烧腊（平溪路店）", "address": "上海市长宁区协和路福泉路255弄57-73号" },
          { "value": "速记黄焖鸡米饭", "address": "上海市长宁区北新泾街道金钟路180号1层01号摊位" },
          { "value": "红辣椒麻辣烫", "address": "上海市长宁区天山西路492号" },
          { "value": "(小杨生煎)西郊百联餐厅", "address": "长宁区仙霞西路88号百联2楼" },
          { "value": "阳阳麻辣烫", "address": "天山西路389号" },
          { "value": "南拳妈妈龙虾盖浇饭", "address": "普陀区金沙江路1699号鑫乐惠美食广场A13" }
        ];
      },
      handleSelect(item) {
        console.log(item);
      },
      handleIconClick(ev) {
        console.log(ev);
      },
      handleClick(tab, event) {
        console.log(tab, event);
      }
    },
    mounted() {
      this.restaurants = this.loadAll();
      let scroll = new BScroll('.wrapper',{
            scrollY: true,
            click: true
      })
      this.getcitydata()
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
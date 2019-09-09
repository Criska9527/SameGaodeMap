<template>
  <div class="parcontent">
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
                   <dl>
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
                   
                   </dl>
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
</template>
<script>
import { mapconfig } from "../assets/config/mapconfig";
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
          typelist:[]
      }
  },
  watch:{
      page(){
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
    }
  },
  mounted() {
    this.search();
  },
  methods: {
    //查询所在区域的数据
    search() {
      this.$axios
        .get(mapconfig.SearchUrl, {
          params: {
            keywords: this.keywords,
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
            this.origincount =  Number(data.count)
            //this.searchlist = data.pois
            for(let item of  data.pois){
                // if(item.bizext.rating){
                //     Number(item.bizext.rating)
                // }
               
               item.biz_ext.rating = Number(item.biz_ext.rating)
               //console.log(item)
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
        

      
      
       
    },
    //优先级筛选
    filterpor(type){
          this.currentpriority = type
    },
    //页码改变事件
    handleCurrentChange(val) {
        this.page = val
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
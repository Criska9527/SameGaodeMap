<template>
  <div class="olMap">
    <div id="map" ref="rootmap"></div>
  </div>
</template>

<script>
//import {BaseMap} from '../assets/js/map'
import "ol/ol.css";
import { Map, View } from "ol";
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';
import { defaults as defaultControls, ScaleLine } from 'ol/control';
import { transform } from 'ol/proj'
import conmonMethods from '../assets/js/commonMethods'
import AMap from 'AMap' // 引入高德地图
export default {
  name: "BaseMap",
  props: {
    msg: String
  },
  data() {
    return {
      map: null,
      coordinate:[],
      publicPath: process.env.BASE_URL
    };
  },
  mounted(){
    this.initMap()
    conmonMethods.location()
  },
  methods: {
    //加载基础地图
    initMap() {
      this.map = new Map({
        target: "map",
        layers: [
           this.addGaodeXYZ()
        ],
        view: new View({
          //transform 进行投影转换,此处4326=>3857
          // center: transform([113.732703, 34.812677], 'EPSG:4326', 'EPSG:3857'),
          center: transform(this.coordinate, 'EPSG:4326', 'EPSG:3857'),
          // center:[],
          projection: "EPSG:3857",
          zoom: 3
        }),
        controls: defaultControls({
                zoom: false,
                rotate: false,
                attribution: false
        })
      });
      this.$store.dispatch('sendmap',this.map)
    },
    //添加高德切片
    addGaodeXYZ(){
      const urls = `http://webrd0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}`
      const layer = new TileLayer({
            source: new XYZ({
                url: urls
            }),
            name: 'baseMap'
        })
        return layer
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="stylus">
    .olMap
      #map
        height: 100%;
        width: 100%;
        margin: 0;
        padding: 0;
        position: relative;
        font-size:50px;
</style>

import "ol/ol.css";

import { transform } from 'ol/proj'
import AMap from 'AMap' // 引入高德地图
import 'ol/ol.css';
import Feature from 'ol/Feature.js';
import Point from 'ol/geom/Point.js';
import VectorLayer from 'ol/layer/Vector.js';
import VectorSource from 'ol/source/Vector.js';
import { Icon, Style, Circle } from 'ol/style.js';
import store from '../../store'



var conmonMethods = {
    //获取数据中指定图层
    getWantedLayer(layername,map){
        for (let layerTmp of map.getLayers().getArray()) {
           
            if (layerTmp.get("name") ==layername) {
                    return layerTmp
            }
        }
    },
    //定位
    location() {
        //const map = this.map
        const map = store.state.map
        const publicPath = process.env.BASE_URL
        var options = {
            'showButton': true,//是否显示定位按钮
            /* LT LB RT RB */
            'buttonOffset': new AMap.Pixel(10, 20),//定位按钮距离对应角落的距离
            'showMarker': false,//是否显示定位点
            'markerOptions': {//自定义定位点样式，同Marker的Options
                'offset': new AMap.Pixel(-18, -36),
            },
            'showCircle': false,//是否显示定位精度圈
        }
        AMap.plugin(["AMap.Geolocation"], function () {
            var geolocation = new AMap.Geolocation(options);
            geolocation.getCurrentPosition(function (status, result) {
                if (status == "complete") {
                    let lon = result.position.lng
                    let lat = result.position.lat
                    let Posname = result.formattedAddress;
                   // _this.coordinate = [lon, lat]
                    //console.log(map)
                   // console.log(map)
                    map.getView().setCenter(transform([lon, lat], 'EPSG:4326', 'EPSG:3857'))
                    map.getView().setZoom(10)
                    let iconStyle = new Style({
                        image: new Icon(({
                            size: [18, 25],
                            src: `${publicPath}images/loc.png`
                        }))
                    });
                    let geometry = new Point(transform([lon, lat], 'EPSG:4326', 'EPSG:3857'))
                    console.log(geometry)
                    let feature = new Feature(geometry);
                    let features = []
                    //设置点位样式
                    feature.setStyle(iconStyle);
                    features.push(feature)
                    //判断有没有图层，有的话清除
                    const layerlocation = conmonMethods.getWantedLayer('locationlayer', map)
                    if (typeof (layerlocation) != "undefined") {
                        console.log('进来了')
                        layerlocation.setSource(null)
                        layerlocation.setSource(new VectorSource({ features: features }))
                    } else {
                        let locationlayer = new VectorLayer({
                            style: function (feature) {
                                return feature.get('style');
                            },
                            source: new VectorSource({ features: features }),
                            name: 'locationlayer'
                        })
                        map.addLayer(locationlayer)
                    }
                    //alert(`您当前的位置为${Posname}`)
                }
            });
            //AMap.event.addListener(geolocation, 'complete', onComplete);
        });
    }
}

export default conmonMethods
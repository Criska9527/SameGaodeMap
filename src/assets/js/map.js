import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import ImageLayer from 'ol/layer/Image'
import ImageWMS from 'ol/source/ImageWMS'
import { defaults as defaultControls, ScaleLine } from 'ol/control';
import { transform } from 'ol/proj'
import XYZ from 'ol/source/XYZ';
import 'ol/ol.css';
import { mapconfig } from '../config/mapconfig'
import { OSM, TileArcGISRest, WMTS } from 'ol/source.js';
import Feature from 'ol/Feature.js';
import Point from 'ol/geom/Point.js';
import VectorLayer from 'ol/layer/Vector.js';
import VectorSource from 'ol/source/Vector.js';
import { Icon, Style, Circle as CircleStyle, Fill, Stroke } from 'ol/style.js';
import Overlay from 'ol/Overlay.js';
import { toStringHDMS } from 'ol/coordinate.js';
import { fromLonLat, toLonLat } from 'ol/proj.js';
import $ from 'jquery'
import { unByKey } from 'ol/Observable.js';
import { getArea, getLength } from 'ol/sphere.js';;
import { LineString, Polygon } from 'ol/geom.js';
import Draw from 'ol/interaction/Draw.js';
import conmonMethods from '../common/js/commonMethods.js'
import {
    equalTo as equalToFilter,
    like as likeFilter,
    and as andFilter
} from 'ol/format/filter.js';
import { WFS, GeoJSON } from 'ol/format.js';
import EqualTo from 'ol/format/filter/EqualTo';
import TileWMS from 'ol/source/TileWMS.js';
import { getWidth, getTopLeft } from 'ol/extent.js';
import { get as getProjection } from 'ol/proj.js';
// import WMTS from 'ol/source/WMTS.js';
import WMTSTileGrid from 'ol/tilegrid/WMTS.js';
import Intersects from 'ol/format/filter/Intersects';
import AMap from 'AMap'





/**
 * 地图操作的主函数
 */
/**
 * 初始化olMap对象
 * 基础地图类
 * @author 周祥毅
 */
class BaseMap {
    //初始化class的时候，默认执行
    constructor() {
        this.map = null
        return this.map
        //初始化地图
        //this.initMap(this.layers);
    }
    /**
     * 初始化地图,传入参数为图层数组
     * @param {*} layers 
     */
    initMap() {
        // 创建地图
        this.map = new Map({
            // 让id为map的div作为地图的容器
            target: 'map',
            // 设置地图图层
            layers: [
                //this.addTdTlayerWMTS('img_c', mapconfig.TDTtoken, 'img'),
                //添加天地图矢量地图
                this.addTdTlayerWMTS('vec_c', mapconfig.TDTtoken, 'vec'),
                //添加标注
               	//this.addTdTlayerWMTS('cva_c', mapconfig.TDTtoken, 'cva'),



                //this.addTdTlayerWMTS('cva_w',mapconfig.TDTtoken,'cva'),
                //绘制层
                //this.addVeclaysLayer()
            ],
            // 设置显示地图的视图
            view: new View({
                //transform 进行投影转换,此处4326=>3857
                // center: transform([113.732703, 34.812677], 'EPSG:4326', 'EPSG:3857'),
                center: [113.732703, 34.812677],
                // center:[],
                projection: 'EPSG:4326',
                zoom: 3
            }),
            controls: defaultControls({
                zoom: false,
                rotate: false,
                attribution: false
            })
        });

    }
    /**
     * @name addTdTlayer 
     * 加载天地图 xyz
     * @author:周祥毅
     * @param {String} lys 
     * @param {String} tk
     * tk是天地图的密钥，请于天地图官网自行申请
     * @return layer 返回一个layer
     */
    addTdTlayer(lys, tk) {
        const urls = `http://t{0-7}.tianditu.gov.cn/DataServer?T=${lys}&x={x}&y={y}&l={z}&tk=${tk}`
        const layer = new TileLayer({
            source: new XYZ({
                url: urls
            }),
            name: lys
        })
        return layer
    }
    /**
     * addTdTlayerWMTS 
     * 加载天地图 wmts
     * @param {*} lys 
     * @param {*} tk 
     * @param {*} layertype 
     */
    addTdTlayerWMTS(lys, tk, layertype) {

        var projection = getProjection("EPSG:4326");

        var projectionExtent = projection.getExtent();
        var size = getWidth(projectionExtent) / 256;
        var resolutions = [];
        for (var z = 2; z < 19; ++z) {//计算比例尺
            resolutions[z] = size / Math.pow(2, z);
        }
        return new TileLayer({//矢量地图
            source: new WMTS({
                url: `http://t0.tianditu.gov.cn/${lys}/wmts?tk=${tk}`,//链接需要添加自己申请的密钥
                layer: layertype,
                style: "default",
                matrixSet: "c",
                format: "tiles",
                wrapX: true,
                tileGrid: new WMTSTileGrid({
                    origin: getTopLeft(projectionExtent),
                    //resolutions: res.slice(0, 15),
                    resolutions: resolutions,
                    matrixIds: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]
                })
            }),
            name: lys
        })
    }
    addVeclaysLayer() {
        return new VectorLayer({
            source: new VectorSource(),
            style: new Style({
                fill: new Fill({
                    color: 'rgba(255, 255, 255, 0.2)'
                }),
                stroke: new Stroke({
                    color: '#ffcc33',
                    width: 2
                }),
                image: new CircleStyle({
                    radius: 7,
                    fill: new Fill({
                        color: '#ffcc33'
                    })
                })
            }),
            name: 'drawfeature'
        })
    }

}
/**
 * @author 周祥毅
 * layer类
 * geojson,ArcgisMapserver,(未来的GeoServer发布的地图服务)
 * 注：目前还不知道如何添加单一图层
 */
class Layer {
    constructor(map) {
        this.baseMap = map
    }
    /**
     * 添加Arcgis的地图服务
     * @param {} url 
     * url是地图服务的地址
     */
    addArcGisMapserver(url) {
        //创建图层
        let arcgisLayer = new TileLayer({
            source: new TileArcGISRest({
                url: url
            })
        })
        //this.map.layers.push(arcgisLayer)
        console.log(this.map)
        //添加图层
        this.baseMap['map'].addLayer(arcgisLayer)
        console.log(this.baseMap['map'].layers)

    }
    addWMTSlayer() {
        let geoserverlayer = new TileLayer({
            extent: [-74.047185, 40.679648,
            -73.90782, 40.882078],
            source: new TileWMS({
                url: 'http://localhost:9527/geoserver/tiger/wms',
                params: {
                    'LAYERS': 'tiger:poly_landmarks',
                    'TILED': true,
                },
                serverType: 'geoserver',
                projection: "EPSG:4326"
            })
        })
        //   this.baseMap['map'].addLayer(geoserverlayer)
        this.baseMap['map'].addLayer(geoserverlayer)
        var bounds = [-74.047185, 40.679648,
        -73.90782, 40.882078];
        //视角转移
        this.baseMap['map'].getView().fit(bounds, this.baseMap['map'].getSize());
    }
}

/**
 * 点类
 * @author 周祥毅
 */
class point {
    constructor(map) {
        this.baseMap = map
    }
    /**
     * 添加点位
     * @param data 传入的json数据
     * @param layer 图层类型
     * 
     */
    addPoint(data, layertype) {

        const map = this.baseMap['map']
        //数据处理
        //当没有传入数据的时候
        if (!data) {
            console.log('请传入点位数据')
            return
        }
        //当数据存在时，对其进行处理
        let feature, geometry, iconurl, iconsize;
        let features = []
        //样式处理
        if (layertype == 'air') {
            //空气站点
            //图标地址
            iconurl = '/static/img/air-point.png'
            iconsize = [18, 18]
        } else if (layertype == 'pollute') {
            //污染源站点
            iconurl = '/static/img/pollute-point.png'
            iconsize = [18, 18]
        } else {
            //默认设置
            iconurl = '/static/img/default-point.png'
            iconsize = [18, 25]
        }
        let iconStyle = new Style({
            image: new Icon(({
                size: iconsize,
                src: iconurl
            }))
        });
        for (let item of data) {
            //新建点要素
            debugger
            const lon = Number(item.lon)
            const lat = Number(item.lat)
            //geometry = new Point(transform([lon, lat], 'EPSG:4326', 'EPSG:3857'), "XY")
            geometry = new Point([lon, lat])
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

        let vector = maplayers.array_.filter((item) => {
            //如果id存在pointlayer，则做处理
            if (item.values_.id == 'pointlayer') {
                return true
            }
        })
        console.log(vector)

        if (vector.length > 0) {
            vector.source = []
            vector.source = vectorSource
            //重新渲染地图
            map.render()

        } else {
            //不存在的时候创建新图层

            vector = new VectorLayer({
                id: 'pointlayer',
                source: vectorSource
            })
            //在地图上添加此图层
            map.addLayer(vector)

        }

    }
}
/**
 * 地图事件
 */
class Map_Mouseover {
    constructor(map) {
        this.baseMap = map
    }
    addclickshowPop() {
        const map = this.baseMap['map']
        //创建弹窗框容器
        var container = document.getElementById("popup");
        var content = document.getElementById("popup-content");
        var popupCloser = document.getElementById("popup-closer");
        console.log(container)
        //当新建Overlay后会自动删除该容器div在页面上
        var overlayPop = new Overlay({
            //设置弹出框的容器
            element: container,
            //是否自动平移，即假如标记在屏幕边缘，弹出时自动平移地图使弹出框完全可见
            autoPan: true,
            autoPanAnimation: {
                duration: 250
            }
        });
        map.on('click', function (e) {
            //在点击时获取像素区域
            var pixel = map.getEventPixel(e.originalEvent);
            console.log(pixel)
            //交叉区域事件
            map.forEachFeatureAtPixel(pixel, function (feature) {
                //coodinate存放了点击时的坐标信息
                var coodinate = e.coordinate;
                console.log(feature)
                //设置弹出框内容，可以HTML自定义
                //content.innerHTML = "<p>点位名称：" + feature.values_.SiteName + "</p>";
                $("#popup .content .title span").html(feature.values_.SiteName)
                content.innerHTML = `<iframe src="${feature.values_.Panelurl}?name=${feature.values_.SiteName}&id=${feature.values_.id}&${feature.values_.lon}&lat=${feature.values_.lat}" frameborder="0"></iframe>`;
                //设置overlay的显示位置
                overlayPop.setPosition(coodinate);
                //显示overlay
                map.addOverlay(overlayPop);
                //显示容器,因为刚开始是隐藏的所以需要显示
                $("#popup").show()
            });
            popupCloser.addEventListener('click', function () {
                overlayPop.setPosition(undefined);
            });
            /**
            * 为map添加鼠标移动事件监听，当指向标注时改变鼠标光标状态
            */
            map.on('pointermove', function (e) {
                var pixel = map.getEventPixel(e.originalEvent);
                var hit = map.hasFeatureAtPixel(pixel);
                map.getTargetElement().style.cursor = hit ? 'pointer' : '';
            })


        });
    }
}
/**
 * 地图工具栏类
 */
class Map_Tools {
    constructor(map) {
        this.baseMap = map
    }
    Measure(measureType) {


        const map = this.baseMap['map']
        //map.getOverlays().clear()

        /**
         * Currently drawn feature.
         * @type {module:ol/Feature~Feature}
         */
        var sketch;


        /**
         * The help tooltip element.
         * @type {Element}
         */
        var helpTooltipElement;


        /**
         * Overlay to show the help messages.
         * @type {module:ol/Overlay}
         */
        var helpTooltip;


        /**
         * The measure tooltip element.
         * @type {Element}
         */
        var measureTooltipElement;


        /**
         * Overlay to show the measurement.
         * @type {module:ol/Overlay}
         */
        var measureTooltip;


        /**
         * Message to show when the user is drawing a polygon.
         * @type {string}
         */
        var continuePolygonMsg = '继续点击绘制多边形';


        /**
         * Message to show when the user is drawing a line.
         * @type {string}
         */
        var continueLineMsg = '继续点击绘制线';

        createMeasureTooltip();
        createHelpTooltip();

        /**
         * Handle pointer move.
         * @param {module:ol/MapBrowserEvent~MapBrowserEvent} evt The event.
         */
        var pointerMoveHandler = function (evt) {
            if (evt.dragging) {
                return;
            }
            /** @type {string} */
            var helpMsg = '请点击开始绘制';

            if (sketch) {
                var geom = (sketch.getGeometry());
                if (geom instanceof Polygon) {
                    helpMsg = continuePolygonMsg;
                } else if (geom instanceof LineString) {
                    helpMsg = continueLineMsg;
                }
            }

            helpTooltipElement.innerHTML = helpMsg;
            helpTooltip.setPosition(evt.coordinate);

            helpTooltipElement.classList.remove('hidden');
        };

        map.on('pointermove', pointerMoveHandler);

        map.getViewport().addEventListener('mouseout', function () {
            helpTooltipElement.classList.add('hidden');
        });

        var draw;
        var formatLength = function (line) {
            var length = getLength(line);
            var output;
            if (length > 100) {
                output = (Math.round(length / 1000 * 100) / 100) +
                    ' ' + 'km';
            } else {
                output = (Math.round(length * 100) / 100) +
                    ' ' + 'm';
            }
            return output;
        };
        var formatArea = function (polygon) {
            var area = getArea(polygon);
            var output;
            if (area > 10000) {
                output = (Math.round(area / 1000000 * 100) / 100) +
                    ' ' + 'km<sup>2</sup>';
            } else {
                output = (Math.round(area * 100) / 100) +
                    ' ' + 'm<sup>2</sup>';
            }
            return output;
        };
        var source;
        // // var layer ;
        // 获取存放feature的vectorlayer层。map初始化的时候可以添加好了
        for (let layerTmp of map.getLayers().getArray()) {
            if (layerTmp.get("name") == "drawfeature") {
                source = layerTmp.getSource();
            }
        }


        function addInteraction() {
            var type = (measureType == 'area' ? 'Polygon' : 'LineString');
            draw = new Draw({
                source: source,
                type: type,
                style: new Style({
                    fill: new Fill({
                        color: 'rgba(255, 255, 255, 0.2)'
                    }),
                    stroke: new Stroke({
                        color: 'rgba(0, 0, 0, 0.5)',
                        lineDash: [10, 10],
                        width: 2
                    }),
                    image: new CircleStyle({
                        radius: 5,
                        stroke: new Stroke({
                            color: 'rgba(0, 0, 0, 0.7)'
                        }),
                        fill: new Fill({
                            color: 'rgba(255, 255, 255, 0.2)'
                        })
                    })
                })
            });
            map.addInteraction(draw);

            var listener;
            draw.on('drawstart',
                function (evt) {
                    // set sketch
                    sketch = evt.feature;

                    /** @type {module:ol/coordinate~Coordinate|undefined} */
                    var tooltipCoord = evt.coordinate;

                    listener = sketch.getGeometry().on('change', function (evt) {
                        var geom = evt.target;
                        var output;
                        if (geom instanceof Polygon) {
                            output = formatArea(geom);
                            tooltipCoord = geom.getInteriorPoint().getCoordinates();
                        } else if (geom instanceof LineString) {
                            output = formatLength(geom);
                            tooltipCoord = geom.getLastCoordinate();
                        }
                        measureTooltipElement.innerHTML = output;
                        measureTooltip.setPosition(tooltipCoord);
                    });
                }, this);

            draw.on('drawend',
                function () {
                    measureTooltipElement.className = 'tooltip tooltip-static';
                    measureTooltip.setOffset([0, -7]);
                    // unset sketch
                    sketch = null;
                    // unset tooltip so that a new one can be created
                    measureTooltipElement = null;
                    createMeasureTooltip();
                    unByKey(listener);
                    map.un('pointermove', pointerMoveHandler);
                    map.removeInteraction(draw);
                    helpTooltipElement.classList.add('hidden');

                }, this);
        }

        //     draw.on('drawend',
        //     function() {
        //       measureTooltipElement.className = 'tooltip tooltip-static';
        //       measureTooltip.setOffset([0, -7]);
        //       // unset sketch
        //       sketch = null;
        //       // unset tooltip so that a new one can be created
        //       measureTooltipElement = null;
        //       createMeasureTooltip();
        //       unByKey(listener);
        //     }, this);
        // }


        function createHelpTooltip() {
            if (helpTooltipElement) {
                helpTooltipElement.parentNode.removeChild(helpTooltipElement);
            }
            helpTooltipElement = document.createElement('div');
            helpTooltipElement.className = 'tooltip hidden';
            helpTooltip = new Overlay({
                element: helpTooltipElement,
                offset: [15, 0],
                positioning: 'center-left'
            });
            map.addOverlay(helpTooltip);
        }

        function createMeasureTooltip() {
            if (measureTooltipElement) {
                measureTooltipElement.parentNode.removeChild(measureTooltipElement);
            }
            measureTooltipElement = document.createElement('div');
            measureTooltipElement.className = 'tooltip tooltip-measure';
            measureTooltip = new Overlay({
                element: measureTooltipElement,
                offset: [0, -15],
                positioning: 'bottom-center'
            });
            map.addOverlay(measureTooltip);
        }
        // 量测调用
        addInteraction();
    }
    Clear() {
        const map = this.baseMap['map']
        //获取绘制图层
        const layerTmp = conmonMethods.getWantedLayer('drawfeature', map)
        console.log(layerTmp)
        //数据清空
        layerTmp.setSource(null)
        $(".tooltip").remove()

        //获取查询图层
        const layersearch = conmonMethods.getWantedLayer('searchfeature', map)
        layersearch.setSource(null)
        // const layerTmps = conmonMethods.getWantedLayer('vec_c', map)
        // layerTmps.setVisible(true)
    }
    /**底图切换 */
    Basemapchange(type) {
        const map = this.baseMap['map']
        const Vecbase = conmonMethods.getWantedLayer('vec_c', map)
        const Imgbase = conmonMethods.getWantedLayer('img_c', map)
        if (type == 'vector') {
            Imgbase.setVisible(true)
            Vecbase.setVisible(false)

        } else {
            Vecbase.setVisible(true)
            Imgbase.setVisible(false)
        }


    }
    //定位
    location() {
        const map = this.baseMap['map']
        console.log(AMap)
        var options = {
            'showButton': false,//是否显示定位按钮
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
                    // let pointxy = transform([lon, lat], 'EPSG:4326', 'EPSG:3857')
                    console.log(status)
                    console.log(result)
                    let Posname = result.formattedAddress;

                    map.getView().setCenter([lon, lat])
                    map.getView().setZoom(14)


                    let iconStyle = new Style({
                        image: new Icon(({
                            size: [18, 25],
                            src: '/static/img/default-point.png'
                        }))
                    });
                    let geometry = new Point([lon, lat])
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
                    alert(`您当前的位置为${Posname}`)





                }


            });
            //AMap.event.addListener(geolocation, 'complete', onComplete);
        });
    }
}
/**
 * 查询类
 */
class Search {
    constructor(map) {
        this.baseMap = map
    }
    /**
     * attrSearch
     * @param {*} keys  关键字
     * 属性查询
     */
    attrSearch(keys) {
        const map = this.baseMap['map']
        //先清空数据层
        //获取查询图层
        debugger
        const layersearch = conmonMethods.getWantedLayer('searchfeature', map)
        if(layersearch){
            layersearch.setSource(null)
        }
     
        //新建查询图层
        let vectorSource = new VectorSource();
        const vector = new VectorLayer({
            source: vectorSource,
            style: new Style({
                stroke: new Stroke({
                    color: 'rgba(0, 0, 255, 1.0)',
                    width: 2
                }),
                fill: new Fill({
                    color: 'rgba(255, 255, 0, 0.6)'
                })
            }),
            name: 'searchfeature'
        });
        //添加到地图
        map.addLayer(vector)


        //查询地址与条件
        var featureRequest = new WFS().writeGetFeature({
            srsName: 'EPSG:4326',
            featureNS: 'http://www.criskamap.com',//工作区url
            featurePrefix: 'zxymap',//工作区名称
            featureTypes: ['zxymap:w2016_china'],//需要查询的图层
            outputFormat: 'application/json',
            filter:
                // likeFilter('CJMC', keys),
                // equalTo('CJMC', keys)
                //ol.format.filter.equalTo('CJMC',keys)
                new EqualTo('MC', keys, false)
            // equalToFilter('CJMC', keys)
            //EqualTo('CJMC',keys,false)
        });
        fetch('/search/wfs', {
            method: 'POST',
            body: new XMLSerializer().serializeToString(featureRequest)
        }).then(function (response) {
            return response.json();
        }).then(function (json) {
            // console.log(json)
            var features = new GeoJSON().readFeatures(json);
            vectorSource.addFeatures(features);
            //定位并放大到查询处
            map.getView().fit(vectorSource.getExtent());
            console.log(features)
        });



    }
    geoSearch() {

        const map = this.baseMap['map']
        const layersearch = conmonMethods.getWantedLayer('searchfeature', map)
        if(layersearch){
            layersearch.setSource(null)
        }
     
        //新建查询图层
        let vectorSource = new VectorSource();
        const vector = new VectorLayer({
            source: vectorSource,
            style: new Style({
                stroke: new Stroke({
                    color: 'rgba(0, 0, 255, 1.0)',
                    width: 2
                }),
                fill: new Fill({
                    color: 'rgba(255, 255, 0, 0.6)'
                })
            }),
            name: 'searchfeature'
        });
        //添加到地图
        map.addLayer(vector)
        var draw; // global so we can remove it later
        function addInteraction() {

            let source;
            // // var layer ;
            // 获取存放feature的vectorlayer层。map初始化的时候可以添加好了
            for (let layerTmp of map.getLayers().getArray()) {
                if (layerTmp.get("name") == "drawfeature") {
                    source = layerTmp.getSource();
                }
            }
            let drawsearch = new Draw({
                source: source,
                type: 'Polygon'
            });
            console.log(drawsearch)
            map.addInteraction(drawsearch);
            drawsearch.on('drawend', function (e) {
                console.log(e)
                map.removeInteraction(draw);
                //console.log(e.feature.geometry())
                //查询地址与条件
                let featureRequests = new WFS().writeGetFeature({
                    srsName: 'EPSG:4326',
                    featureNS: 'http://www.criskamap.com',//工作区url
                    featurePrefix: 'zxymap',//工作区名称
                    featureTypes: ['zxymap:w2016_china'],//需要查询的图层
                    outputFormat: 'application/json',
                    // geometryName: "the_geom",                                  
                    filter: new Intersects('the_geom', e.feature.getGeometry())

                });
                fetch('/search/wfs', {
                    method: 'POST',
                    body: new XMLSerializer().serializeToString(featureRequests)
                }).then(function (response) {

                    return response.json();
                }).then(function (json) {
                    var features = new GeoJSON().readFeatures(json);
                    vectorSource.addFeatures(features);
                    //定位并放大到查询处
                    map.getView().fit(vectorSource.getExtent());
                    console.log(features)
                });

            }, this);

        }
        addInteraction()
    }
}
/**
 * 路径规划类
 */
class Driving{
    constructor(map) {
        this.baseMap = map
    }
    driver(){
        const map = this.baseMap['map']
        //console
        AMap.plugin('AMap.Driving', function() {
            var driving = new AMap.Driving({
              // 驾车路线规划策略，AMap.DrivingPolicy.LEAST_TIME是最快捷模式
              policy: AMap.DrivingPolicy.LEAST_TIME
            })
            
            var points = [
              { keyword: '牡丹路站',city:'郑州' },
              { keyword: '大学南郡',city:'郑州' }
            ]
            
            driving.search(points, function (status, result) {
                //console.log(result.routes[0].steps)
                if(status === 'complete'){
                    //存放路经点位的数组
                    let roadarray = []
                    let roads = {
                        time:result.routes[0].time,
                        distance:result.routes[0].distance,
                        steps:result.routes[0].steps,
                        start:result.start,
                        end:result.end
                    }
                    //遍历路线处理数据
                    for(let item of roads.steps){
                        console.log(item.path)
                        //循环路径数据
                        for(let initem of item.path){
                            //console.log(initem)
                             roadarray.push([initem.lng,initem.lat])
                        }
                    }
                    console.log(roadarray)
                    //实例化一个矢量图层Vector作为绘制层
                    //新建数据源
                    debugger;
                    let vectorSource = new VectorSource(
                        {   type: 'LineString'}
                    );
                    let LineStringFeature = new Feature(
                        {geometry:new LineString(roadarray,'XY')}
                        
                    ); 
                    //将线添加到Vector绘制层上
                    vectorSource.addFeature(LineStringFeature);
                    const vector = new VectorLayer({
                     
                        source: vectorSource,
                        style: new Style({
                            fill: new Fill({
                                color: '#0044CC'
                            }),
                            stroke: new Stroke({
                                color: 'rgba(0, 0, 255, 1.0)',
                                width: 2
                            })
                        }),
                        name: 'driving'
                    });
                     map.addLayer(vector)
                     
        //获取查询图层
        const layersearch = conmonMethods.getWantedLayer('cva_c', map)
        const layerTmps = conmonMethods.getWantedLayer('vec_c', map)
        layersearch.setVisible(true)
        //layerTmps.setVisible(false)
                    //console.log(vector)
                    //parent.mainmap.addLayer(vector)
                    
        
        
                }
                //获取路线处理
        
            })
          })
    }
}



export { BaseMap, Layer, point, Map_Mouseover, Map_Tools, Search,Driving }
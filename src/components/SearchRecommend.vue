<template>
  <div class="ParContent">
    <div class="Search">
      <div class="search-item">
        <img :src="imgurl" alt="">
        <el-input v-model="input" placeholder="搜索位置，公交站，地铁" class="search-input"></el-input>
        <div class="searchbtn iconfont iconsousuo1">
            <!-- <i class="iconfont iconsousuo1"></i> -->
        </div>
        <div class="search-road-btn iconfont iconroute">
            
        </div>
      </div>
    </div>
  </div>
</template>
<script>

export default {
  name:'Search',
  data() {
    return {
      input: "",
      imgurl:`${process.env.BASE_URL}images/default.png`
    };
  }
};
</script>
<style lang="stylus" scoped>
@import '~styles/varibles.styl'
@import '~styles/mixins.styl'

        
</style>
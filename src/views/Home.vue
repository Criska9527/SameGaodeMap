<template>
  <div class="home">
    <!-- <img alt="Vue logo" src="../assets/logo.png"> -->
    <city-chose></city-chose>
    <search></search>
   <base-map></base-map>
  </div>
</template>

<script>
// @ is an alias to /src
import BaseMap from '@/components/BaseMap.vue'
import CityChose from '@/components/citychose.vue'
import Search from '@/components/Search.vue'

export default {
  name: 'home',
  components: {
    BaseMap,
    CityChose,
    Search
  }
}
</script>

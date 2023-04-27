<template>
  <div id="app">
	  <!-- keep-alive 内置组件，缓存组件，提升性能 -->
	  
	  <!-- 需要缓存的路由 -->
	<keep-alive>
		<router-view v-if="$route.meta.keepAlive"></router-view>
	</keep-alive>
	<!-- 不需要缓存的路由 -->
	<router-view v-if="!$route.meta.keepAlive"></router-view>
    
  </div>
</template>
<script>
	export default{
		created(){
			this.$store.commit('INIT_USER');
		}
	}
</script>
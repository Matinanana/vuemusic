<template>
  <div id="app">
  	<!--头部引入：m-header-->
 		<m-header></m-header>
 		<!--导航栏-->
 		<tab></tab>
 		<!--避免切换过程中重新加载内容 使用缓存标签-->
 		<keep-alive>
	 		<!--router引入-->
	 		<router-view></router-view>
	 	</keep-alive>
	 	<!--播放引入-->
	 	<player></player>
  </div>
</template>

<script>
	import MHeader from 'components/m-header/m-header'
	import Tab from 'components/tab/tab'//引入tab.vue
	import Player from 'components/player/player'//引入player.vue
	
	export default {
		//注册
		components:{
			MHeader,
			Tab,
			Player
		}
	}
</script>

<style>

</style>

<template>
  <div class="recommend" ref="recommend">
  	<!--当discLiat渲染完后，再滑动，这里使用：:data-->
    <scroll ref="scroll" class="recommend-content" :data="discList">
    	<!--使用scroll是只有父级元素的第一个子元素滚动 所以添加一个div为第一个子元素-->
    	<div>
	    	<!--当recommends渲染完后（slot插槽有东西）才能执行slider.vue里面的mounted的方法，
	    	因为获取轮播图数据是异步执行，不用v-if会导致数据还没有获取到就执行mounted，会报错-->
        <div v-if="recommends.length" class="slider-wrapper">
        	<slider> <!--使用轮播图标签-->
        		<div v-for="item in recommends"><!--创建一个div用v-for展现轮播图信息-->
        			<a :href="item.linkUrl"><!--点击跳转事件-->
        				<!--load加载时调用一个方法更新scroll,获取轮播图图片-->
        				<!--needsclick解决多个插件影响轮播图不能点击的问题，
        					主要是与fastclick发生冲突-->
        				<img class="needsclick" @load="loadImage" :src="item.picUrl" />
        			</a>
        		</div>
        	</slider>
        </div>
        <div class="recommend-list">
          <h1 class="list-title">热门歌单推荐</h1>
          <ul>
          	<li @click="selectItem(item)" v-for="item of discList" class="item">
          		<div class="icon">
          			<img width="60px" height="60px" v-lazy="item.imgurl"/>
          		</div>
          		<div class="text">
          			<h2 class="name" v-html="item.creator.name"></h2>
          			<p class="desc" v-html="item.dissname"></p>
          		</div>
          	</li>
          </ul>
        </div>
      </div>
      <!--提示：加载中-->
      <div class="loading-container" v-show="!discList.length">
      	<loading></loading>
      </div>
     </scroll>
     <router-view></router-view>
  </div>
</template>

<script type="text/ecmascript-6">
	import Slider from 'base/slider/slider' //引入slider.vue轮播图组件
	import {getRecommend,getDiscList} from 'api/recommend'//引入获取数据的方法
	import {ERR_OK} from 'api/config'
	import Scroll from 'base/scroll/scroll' //引入上下滑动scroll组件
	import Loading from 'base/loading/loading' //引入提示：加载中loading组件
	import {playlistMixin} from 'common/js/mixin'
	import {mapMutations} from 'vuex'
	
	export default{
		mixins:[playlistMixin],
		data(){
			return {
				recommends:[], //轮播图信息			
				discList:[]//歌单列表
			}
		},
		created(){
//			setTimeout(()=>{//判断轮播图延时时，scroll是否会自动更新
					this._getRecommend()
//			},2000)
			this._getDiscList()
		},
		methods:{
			handlePlaylist(playlist){
				const bottom=playlist.length>0?'60px':''
				this.$refs.recommend.style.bottom=bottom
				this.$refs.scroll.refresh()
			},
			selectItem(item){//点击事件，跳转到歌单页面
				this.$router.push({
					path:`/recommend/${item.dissid}`
				})
				this.setDisc(item)
			},
			_getRecommend(){//获取轮播图数据
				getRecommend().then((res)=>{
					if(res.code===ERR_OK){
						this.recommends=res.data.slider 
					}
				})
			},
			_getDiscList(){//获取歌单数据
				getDiscList().then((res)=>{
					if(res.code===ERR_OK){
						this.discList=res.data.list
					}
				})
			},
			loadImage(){//加载轮播图时更新scroll
				if(!this.checkLoaded){
					this.$refs.scroll.refresh()
					this.checkLoaded=true
				}
			},
			...mapMutations({
				setDisc:'SET_DISC'
			})
		},
		components:{
			Slider, //注册轮播图
			Scroll,//注册滑动
			Loading
		}
	}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"

  .recommend
    position: fixed
    width: 100%
    top: 88px
    bottom: 0
    .recommend-content
      height: 100%
      overflow: hidden
      .slider-wrapper
        position: relative
        width: 100%
        overflow: hidden
      .recommend-list
        .list-title
          height: 65px
          line-height: 65px
          text-align: center
          font-size: $font-size-medium
          color: $color-theme
        .item
          display: flex
          box-sizing: border-box
          align-items: center
          padding: 0 20px 20px 20px
          .icon
            flex: 0 0 60px
            width: 60px
            padding-right: 20px
          .text
            display: flex
            flex-direction: column
            justify-content: center
            flex: 1
            line-height: 20px
            overflow: hidden
            font-size: $font-size-medium
            .name
              margin-bottom: 10px
              color: $color-text
            .desc
              color: $color-text-d
      .loading-container
        position: absolute
        width: 100%
        top: 50%
        transform: translateY(-50%)
</style>
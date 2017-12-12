<template>
  <div class="music-list">
    <div class="back" @click="back">
      <i class="icon-back"></i>
    </div>
    <h1 class="title" v-html="title"></h1>
    <div class="bg-image" :style="bgStyle" ref="bgImage">
    	<div class="play-wrapper">
    		<div class="play" v-show="songs.length>0" 
    			ref="playBtn" @click="random">
    			<i class="icon-play"></i>
    			<span class="text">随机播放全部</span>
    		</div>
    	</div>
      <div class="filter" ref="filter"></div>
    </div>
    <div class="bg-layer" ref="layer"></div>
    <scroll @scroll="scroll" :probe-type="probeType" 
    	:listen-scroll="listenScroll" 
    	:data="songs" class="list" ref="list">
    	<div class="song-list-wrapper">
    		<song-list :rank="rank" @select="selectItem" :songs="songs"></song-list>
    	</div>
    	<div class="loading-container" v-show="!songs.length">
    		<loading></loading>
    	</div>
    </scroll>
  </div>
</template>

<script type="text/ecmascript-6">
	import Scroll from 'base/scroll/scroll'
	import SongList from 'base/song-list/song-list'
	import Loading from 'base/loading/loading'
	import {prefixStyle} from 'common/js/dom'
	import {mapActions} from 'vuex'//vuex的语法糖
	import {playlistMixin} from 'common/js/mixin'
	
	const RESERVED_HEIGHT=40//预留高度
	const transform=prefixStyle('transform')//添加样式
	const backdrop=prefixStyle('backdrop-filter')//添加样式
	export default{
		mixins:[playlistMixin],
		props:{
			bgImage:{//背景图片
				type:String,
				default:''
			},
			songs:{//歌曲数组
				type:Array,
				default:[]
			},
			title:{//标题
				type:String,
				default:''
			},
			rank:{//是否有榜单
				type:Boolean,
				default:false
			}
		},
		data(){
			return {
				scrollY:0
			}
		},
		computed:{
			bgStyle(){
				return `background-image:url(${this.bgImage})`//设置背景图片
			}
		},
		created(){
			this.probeType=3
			this.listenScroll=true//监听滚动事件
		},
		mounted(){
			this.imageHeight=this.$refs.bgImage.clientHeight//背景图片的高度
			this.minTranslateY=-this.imageHeight+RESERVED_HEIGHT
			this.$refs.list.$el.style.top=`${this.imageHeight}px`//设置list的高度
		},
		methods:{
			handlePlaylist(playlist){
				const bottom=playlist.length>0?'60px':''
				this.$refs.list.$el.style.bottom=bottom
				this.$refs.list.refresh()
			},
			scroll(pos){//获取y轴的坐标
				this.scrollY=pos.y
			},
			back(){
				this.$router.back()//后退一步
			},
			selectItem(item,index){
				//设置playerlist,sequencelist,currentIndex,playState,fullScreen
				this.selectPlay({
					list:this.songs,
					index
				})
			},
			random(){//点击随机播放全部
				this.randomPlay({
					list:this.songs
				})
			},
			...mapActions([
				'selectPlay',
				'randomPlay'
			])
		},
		watch:{
			scrollY(newY){//监听y轴的变化
				let translateY=Math.max(this.minTranslateY,newY)
				this.$refs.layer.style[transform]=`translate3d(0,${translateY}px,0)`
				let zIndex=0
				let scale=1//缩放
				let blur=0//高斯模糊
				const percent=Math.abs(newY/this.imageHeight) //实现无缝放大的公式
//				console.log(percent)
				if(newY>0){
					scale=1+percent
					zIndex=10
				}else{
					blur=Math.min(20*percent,20)//设置高斯模糊度数
				}
				this.$refs.filter.style[backdrop]=`blur(${blur}px)`//设置高斯模糊度
				if(newY<this.minTranslateY){//上拉到最小距离时
					zIndex=10
					this.$refs.bgImage.style.paddingTop=0
					this.$refs.bgImage.style.height=`${RESERVED_HEIGHT}px`
					this.$refs.playBtn.style.display='none'//随机播放按钮设置为none
				}else{//下拉时
					this.$refs.bgImage.style.paddingTop='70%'
					this.$refs.bgImage.style.height=0
					this.$refs.playBtn.style.display=''//随机播放按钮设置为空
					
				}
//				console.log(zIndex)
				this.$refs.bgImage.style.zIndex=zIndex
				//设置背景图片放大
				this.$refs.bgImage.style[transform]=`scale(${scale})`
			}
		},
		components:{
			Scroll,
			SongList,
			Loading
		}
	}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .music-list
    position: fixed
    z-index: 100
    top: 0
    left: 0
    bottom: 0
    right: 0
    background: $color-background
    .back
      position absolute
      top: 0
      left: 6px
      z-index: 50
      .icon-back
        display: block
        padding: 10px
        font-size: $font-size-large-x
        color: $color-theme
    .title
      position: absolute
      top: 0
      left: 10%
      z-index: 40
      width: 80%
      no-wrap()
      text-align: center
      line-height: 40px
      font-size: $font-size-large
      color: $color-text
    .bg-image
      position: relative
      width: 100%
      height: 0
      padding-top: 70%
      transform-origin: top
      background-size: cover
      .play-wrapper
        position: absolute
        bottom: 20px
        z-index: 50
        width: 100%
        .play
          box-sizing: border-box
          width: 135px
          padding: 7px 0
          margin: 0 auto
          text-align: center
          border: 1px solid $color-theme
          color: $color-theme
          border-radius: 100px
          font-size: 0
          .icon-play
            display: inline-block
            vertical-align: middle
            margin-right: 6px
            font-size: $font-size-medium-x
          .text
            display: inline-block
            vertical-align: middle
            font-size: $font-size-small
      .filter
        position: absolute
        top: 0
        left: 0
        width: 100%
        height: 100%
        background: rgba(7, 17, 27, 0.4)
    .bg-layer
      position: relative
      height: 100%
      background: $color-background
    .list
      position: fixed
      top: 0
      bottom: 0
      width: 100%
      background: $color-background
      .song-list-wrapper
        padding: 20px 30px
      .loading-container
        position: absolute
        width: 100%
        top: 50%
        transform: translateY(-50%)
</style>
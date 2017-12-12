<template>
  <div class="player" v-show="playlist.length>0">
  	<transition name="normal"
                @enter = "enter"
                @after-enter="afterEnter"
                @leave = "leave"
                @after-leave="afterLeave"
    >
      <div class="normal-player" v-show="fullScreen">
      	<!--播放器-->
      	<div class="background">
      		<img width="100%" height="100%" :src="currentSong.image"/>
      	</div>
      	<div class="top">
      		<div class="back" @click="back">
      		<i class="icon-back"></i>
      		</div>
      		<h1 class="title" v-html="currentSong.name"></h1>
      		<h2 class="subtitle" v-html="currentSong.singer"></h2>
      	</div>
      	<div class="middle"
      		@touchstart.prevent="middleTouchStart" 
      		@touchmove.prevent="middleTouchMove" 
      		@touchend.prevent="middleTouchEnd" 
      		>
      		<div class="middle-l" ref="middleL">
      			<div class="cd-wrapper" ref="cdWrapper">
      				<div class="cd" :class="cdCls">
      					<img class="image" :src="currentSong.image"/>
      				</div>
      			</div>
      			<div class="playing-lyric-wrapper">
	      			<div class="playing-lyric">{{playingLyric}}</div>
	      		</div>
      		</div>
      		<scroll class="middle-r" ref="lyricList" :data="currentLyric&&currentLyric.lines">
      			<div class="lyric-wrapper">
      				<div v-if="currentLyric">
      					<p class="text" ref="lyricLine" 
      						:class="{'current':currentLineNum===index}"
      						v-for="(line,index) in currentLyric.lines">
      						{{line.txt}}
      					</p>
      				</div>
      			</div>
      		</scroll>
      	</div>
      	<div class="bottom">
      		<div class="dot-wrapper">
      			<span class="dot" :class="{'active':currentShow==='cd'}"></span>
      			<span class="dot" :class="{'active':currentShow==='lyric'}"></span>
      		</div>
      		<div class="progress-wrapper">
      			<span class="time time-l">{{format(currentTime)}}</span>
      			<div class="progress-bar-wrapper">
      				<progress-bar :percent="percent" @percentChange="onProgressBarChange"></progress-bar>
      			</div>
      			<span class="time time-r">{{format(currentSong.duration)}}</span>
      		</div>
      		<div class="operators">
      			<div class="icon i-left" @click="changeMode">
      				<i :class="iconMode"></i>
      			</div>
      			<div class="icon i-left" :class="disableCls">
      				<i @click="prev" class="icon-prev"></i>
      			</div>
      			<div class="icon i-center" :class="disableCls">
      				<i @click="togglePlaying" :class="playIcon"></i>
      			</div>
      			<div class="icon i-right" :class="disableCls">
      				<i @click="next" class="icon-next"></i>
      			</div>
      			<div class="icon i-right">
      				<i class="icon" 
      					@click="toggleFavorite(currentSong)" 
      					:class="getFavoriteIcon(currentSong)"></i>
      			</div>
      		</div>
      	</div>
      </div>
    </transition>  
    <transition name="mini">
			<div class="mini-player" v-show="!fullScreen" @click="open">
      	<div class="icon">
      		<img :class="cdCls" width="40" height="40" :src="currentSong.image"/>
      	</div>
      	<div class="text">
	      	<h2 class="name" v-html="currentSong.name"></h2>
	      	<p class="desc" v-html="currentSong.singer"></p>
      </div>
      <div class="control">
      	<!--圆形进度条-->
      	<progress-circle :radius="radius" :percent="percent">
      		<!--@click.stop这里stop是阻止冒泡-->
      		<i @click.stop="togglePlaying" class="icon-mini" :class="miniplayIcon"></i>
      	</progress-circle>
      </div>
      <div class="control" @click.stop="showPlaylist">
      	<i class="icon-playlist"></i>
      </div>
    </div>
   </transition>  
   <playlist ref="playlist"></playlist>
   <!--@canplay="ready" 当歌曲被读到时 才可以被切换-->
   <audio ref="audio" :src="currentSong.url" 
   	@play="ready" 
   	@error="error" 
   	@timeupdate="updateTime" 
   	@ended="end"></audio>
  </div>
</template>

<script type="text/ecmascript-6">
	import {mapGetters,mapMutations,mapActions} from 'vuex'
	import animations from 'create-keyframe-animation'
	import {prefixStyle} from 'common/js/dom'
	import ProgressBar from 'base/progress-bar/progress-bar.vue'
	import ProgressCircle from 'base/progress-circle/progress-circle.vue'

	import {playMode} from 'common/js/config'
	import Lyric from 'lyric-parser'
	import Scroll from 'base/scroll/scroll'
	import Playlist from 'components/playlist/playlist'
	import {playerMixin} from 'common/js/mixin'
	
	const transform=prefixStyle('transform')
	const transitionDuration=prefixStyle('transitionDuration')
	export default{
		mixins:[playerMixin],
		data(){
			return{
				songReady:false,//标志位 歌曲是否被读到
				currentTime:0,//当前时间
				radius:32,//圆形进度条的半径
				currentLyric:null,//当前歌词
				currentLineNum:0,//当前歌词所在的行
				currentShow:'cd',//默认显示cd播放面，不显示歌词播放面
				playingLyric:''
				
			}
		},
		computed:{
			cdCls(){ //给CD添加旋转或不旋转
				return this.playing?'play':'play pause'
			},
			playIcon(){//给播放按钮添加样式：播放或暂停
				//做判断给出样式
				return this.playing?'icon-pause':'icon-play'
			},
			miniplayIcon(){
				return this.playing?'icon-pause-mini':'icon-play-mini'
			},
			disableCls(){//添加disable属性
				return this.songReady?'':'disable'
			},
			percent(){//获取播放时间百分比
				return this.currentTime/this.currentSong.duration
			},
		...mapGetters([
				'fullScreen',
				'playing',
				'currentIndex'
			])
		},
		created(){
			this.touch={}//创建touch事件，主要用于cd和lyric页面的切换操作
		},
		methods:{
			back(){//实现迷你播放
				this.setFullScreen(false)
			},
			open(){//实现全屏播放
				this.setFullScreen(true)
			},
			enter(el,done){//cd动画效果
				const {x,y,scale}=this._getPosAndScale()//获取x,y,scale
				
				let animation={//定义动画效果
					0:{
						transform:`translate3d(${x}px,${y}px,0) scale(${scale})`
					},
					60:{
						transform:`translate3d(0,0,0) scale(${1.1})`
					},
					100:{
						transform:`translate3d(0,0,0) scale(${1})`
					}
				}
				
				animations.registerAnimation({//注册动画
					name:'move',
					animation,
					presets:{
						duration:400,
						easing:'linear'
					}
				})
				//使用动画
				animations.runAnimation(this.$refs.cdWrapper,'move',done)
			},
			afterEnter(){
				animations.unregisterAnimation('move')
				this.$refs.cdWrapper.style.animation=''
			},
			leave(el,done){
				this.$refs.cdWrapper.style.transition='all 0.4s'
				const {x,y,scale}=this._getPosAndScale()
				this.$refs.cdWrapper.style[transform]=`translate3d(${x}px,${y}px,0) scale(${scale})`
				this.$refs.cdWrapper.addEventListener('transitionend',done)
				
			},
			afterLeave(){
				this.$refs.cdWrapper.style.transition=''
				this.$refs.cdWrapper.style[transform]=''
			},
			togglePlaying(){//点击播放按钮
				if(!this.songReady){
					return
				}
				this.setPlayingState(!this.playing)
				if(this.currentLyric){//实现歌词的暂停和滑动
					this.currentLyric.togglePlay()
				}
			},
			prev(){//上一首
				if(!this.songReady){//如果歌曲没有读到，点击上一首直接返回
					return
				}
				//播放列表只有一首歌的时候
				if(this.playList.length===1){
					this.loop()
					return
				}else{
					let index=this.currentIndex-1
					//到第一首歌曲减一时，索引为最后一首歌
					if(index===-1){
						index=this.playlist.length-1
					}
					this.setCurrentIndex(index)
					if(!this.playing){//切换播放按钮
						this.togglePlaying()
					}
				}
				this.songReady=false
			},
			end(){//播放结束之后执行
				//如果单曲循环
				if(this.mode===playMode.loop){
					this.loop()
				}else{//否则播放下一首
					this.next()
				}
			},
			loop(){//单曲循环播放
				this.$refs.audio.currentTime=0//歌曲总时间设置为0
				this.$refs.audio.play()//然后播放
				//单曲播放时，自动播放下一首还是同一首，把当前的行设置为第一行
				if(this.currentLyric){
					this.currentLyric.seek(0)
				}
			},
			next(){//下一首
				if(!this.songReady){
					return
				}
				//播放列表只有一首歌的时候
				if(this.playlist.length===1){
					this.loop()
					return
				}else{
					let index=this.currentIndex+1
					//到最后一个歌曲加一时，索引为0
					if(index===this.playlist.length){
						index=0
					}
					this.setCurrentIndex(index)
					if(!this.playing){
						this.togglePlaying()
					}
				}
				this.songReady=false
			},
			ready(){//设置歌曲是否被读取到 为true
				this.songReady=true
				this.savePlayHistory(this.currentSong)
			},
			error(){//当无网络，歌曲下载失败
				this.songReady=true
			},
			updateTime(e){
				this.currentTime=e.target.currentTime//audio当前播放的时间
			},
			format(interval){//把时间帧转化为分秒
				interval=interval|0
				const minute=interval/60|0
				const second=this._pad(interval%60)
				return `${minute}:${second}`
			},
			onProgressBarChange(percent){
				const currentTime=this.currentSong.duration*percent
				this.$refs.audio.currentTime=currentTime
				if(!this.playing){
					this.togglePlaying()
				}
				//进度条变化时同步歌词
				if(this.currentLyric){
					this.currentLyric.seek(currentTime*1000)
				}
			},
			getLyric(){//歌词
				this.currentSong.getLyric().then((lyric)=>{
					if(this.currentSong.lyric!==lyric){
						return
					}
					this.currentLyric=new Lyric(lyric,this.handleLyric)
					if(this.playing){//如果播放就播放歌词
						this.currentLyric.play()
					}
//					console.log(this.currentLyric)
				}).catch(()=>{
					this.currentLyric=null
					this.playingLyric=''
					this.currentLineNum=0
				})
			},
			handleLyric({lineNum,txt}){//歌词
				this.currentLineNum=lineNum
				if(lineNum>5){//行数大于5时，向上移动
					let lineEl=this.$refs.lyricLine[lineNum-5]
					this.$refs.lyricList.scrollToElement(lineEl,1000)
				}else{//行数小于5时，不移动
					this.$refs.lyricList.scrollTo(0,0,1000)
				}
				this.playingLyric=txt
			},
			showPlaylist(){//显示播放列表
				this.$refs.playlist.show()
			},
			middleTouchStart(e){//播放页面中间部分的touch事件
				this.touch.initiated=true
				const touch=e.touches[0]//第一个手指点击
				this.touch.startX=touch.pageX//第一个手指点击的x轴
				this.touch.startY=touch.pageY//第一个手指点击的y轴
			},
			middleTouchMove(e){
				if(!this.touch.initiated){//如果没有初始化为true
					return
				}
				const touch=e.touches[0]
				//手指滑动差值
				const deltaX=touch.pageX-this.touch.startX
				const deltaY=touch.pageY-this.touch.startY
				//y轴大于x轴时是歌词的上下滑动
				if(Math.abs(deltaY)>Math.abs(deltaX)){
					return
				}
				//设置以哪个轴为主轴进行偏移
				const left=this.currentShow==='cd'?0:-window.innerWidth
				//x轴偏移量
				const offsetWidth=Math.min(0,Math.max(-window.innerWidth,left+deltaX))
				this.touch.percent=Math.abs(offsetWidth/window.innerWidth)//x轴偏移百分比
				//偏移中间部分   使用.$el是因为它的元素是scroll要用.el才可以获取到元素
				this.$refs.lyricList.$el.style[transform]=`translate3d(${offsetWidth}px,0,0)`
				this.$refs.lyricList.$el.style[transitionDuration]=0
				//设置透明度
				this.$refs.middleL.style.opacity=1-this.touch.percent
				this.$refs.middleL.style[transitionDuration]=0
				
			},
			middleTouchEnd(e){
				let offsetWidth
				let opacity
				if(this.currentShow==='cd'){
					if(this.touch.percent>0.1){
						offsetWidth=-window.innerWidth
						opacity=0
						this.currentShow='lyric'
					}else{
						offsetWidth=0
						opacity=1
					}
				}else{
					if(this.touch.percent<0.9){
						offsetWidth=0
						this.currentShow='cd'
						opacity=1
					}else{
						offsetWidth=-window.innerWidth
						opacity=0
					}
				}
				const time=300
				this.$refs.lyricList.$el.style[transform]=`translate3d(${offsetWidth}px,0,0)`
				this.$refs.lyricList.$el.style[transitionDuration]=`${time}ms`
				//设置透明度
				this.$refs.middleL.style.opacity=opacity
				this.$refs.middleL.style[transitionDuration]=`${time}ms`
			},
			_pad(num,n=2){//秒补两位数
				let len=num.toString().length
				while(len<n){//当小于两位时补零
					num='0'+num
					len++
				}
				return num
			},
			_getPosAndScale(){
				const targetWidth=40//迷你cd的宽度
				const paddingLeft=40//迷你cd中心轴距离左边的距离
				const paddingBottom=30//迷你cd中心轴距离下边的距离
				const paddingTop=80//大cd距离顶部的距离
				const width=window.innerWidth*0.8//大cd的宽度
				//缩放比例
				const scale=targetWidth/width
				//以大cd的中心点为圆点设置x轴y轴
				const x=-(window.innerWidth/2-paddingLeft)//迷你cd的x轴 
				//迷你cd的y轴
				const y=window.innerHeight-paddingTop-width/2-paddingBottom
				return{
					x,
					y,
					scale
				}
			},
			...mapMutations({
				setFullScreen:'SET_FULL_SCREEN'
			}),
			...mapActions([
				'savePlayHistory'
			])
		},
		watch:{
			currentSong(newSong,oldSong){//监听currentSong的变化
				if(!newSong.id){
					return
				}
				if(newSong.id===oldSong.id){
					return
				}
				//如果之前存在当前歌词就停止它，再获取现在的当前歌词
				if(this.currentLyric){
					this.currentLyric.stop()
					this.currentTime = 0
          this.playingLyric = ''
          this.currentLineNum = 0
				}
				//发生变化时播放音乐，相当于点击某个歌曲进入播放页面currentSong发生改变
				//就播放音乐
				clearTimeout(this.timer)
				this.timer=setTimeout(()=>{//在下次 DOM 更新循环结束之后执行延迟回调
					this.$refs.audio.play()//播放
					this.getLyric()//获取歌词
				},1000)
			},
			playing(newPlaying){//监听playing的变化，做出播放或暂停动作
				const audio=this.$refs.audio
				this.$nextTick(()=>{
					//playing:true执行播放，play:false执行暂停
					newPlaying?audio.play():audio.pause()
				})
			},
			fullScreen(newVal) {
        if (newVal) {
          setTimeout(() => {
            this.$refs.lyricList.refresh()
          }, 20)
        }
      }
		},
		components:{
			ProgressBar,
			ProgressCircle,
			Scroll,
			Playlist
		}
	}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .player
    .normal-player
      position: fixed
      left: 0
      right: 0
      top: 0
      bottom: 0
      z-index: 150
      background: $color-background
      .background
        position: absolute
        left: 0
        top: 0
        width: 100%
        height: 100%
        z-index: -1
        opacity: 0.6
        filter: blur(20px)
      .top
        position: relative
        margin-bottom: 25px
        .back
          position absolute
          top: 0
          left: 6px
          z-index: 50
          .icon-back
            display: block
            padding: 9px
            font-size: $font-size-large-x
            color: $color-theme
            transform: rotate(-90deg)
        .title
          width: 70%
          margin: 0 auto
          line-height: 40px
          text-align: center
          no-wrap()
          font-size: $font-size-large
          color: $color-text
        .subtitle
          line-height: 20px
          text-align: center
          font-size: $font-size-medium
          color: $color-text
      .middle
        position: fixed
        width: 100%
        top: 80px
        bottom: 170px
        white-space: nowrap
        font-size: 0
        .middle-l
          display: inline-block
          vertical-align: top
          position: relative
          width: 100%
          height: 0
          padding-top: 80%
          .cd-wrapper
            position: absolute
            left: 10%
            top: 0
            width: 80%
            height: 100%
            .cd
              width: 100%
              height: 100%
              box-sizing: border-box
              border: 10px solid rgba(255, 255, 255, 0.1)
              border-radius: 50%
              &.play
                animation: rotate 20s linear infinite
              &.pause
                animation-play-state: paused
              .image
                position: absolute
                left: 0
                top: 0
                width: 100%
                height: 100%
                border-radius: 50%

          .playing-lyric-wrapper
            width: 80%
            margin: 30px auto 0 auto
            overflow: hidden
            text-align: center
            .playing-lyric
              height: 20px
              line-height: 20px
              font-size: $font-size-medium
              color: $color-text-l
        .middle-r
          display: inline-block
          vertical-align: top
          width: 100%
          height: 100%
          overflow: hidden
          .lyric-wrapper
            width: 80%
            margin: 0 auto
            overflow: hidden
            text-align: center
            .text
              line-height: 32px
              color: $color-text-l
              font-size: $font-size-medium
              &.current
                color: $color-text
      .bottom
        position: absolute
        bottom: 50px
        width: 100%
        .dot-wrapper
          text-align: center
          font-size: 0
          .dot
            display: inline-block
            vertical-align: middle
            margin: 0 4px
            width: 8px
            height: 8px
            border-radius: 50%
            background: $color-text-l
            &.active
              width: 20px
              border-radius: 5px
              background: $color-text-ll
        .progress-wrapper
          display: flex
          align-items: center
          width: 80%
          margin: 0px auto
          padding: 10px 0
          .time
            color: $color-text
            font-size: $font-size-small
            flex: 0 0 30px
            line-height: 30px
            width: 30px
            &.time-l
              text-align: left
            &.time-r
              text-align: right
          .progress-bar-wrapper
            flex: 1
        .operators
          display: flex
          align-items: center
          .icon
            flex: 1
            color: $color-theme
            &.disable
              color: $color-theme-d
            i
              font-size: 30px
          .i-left
            text-align: right
          .i-center
            padding: 0 20px
            text-align: center
            i
              font-size: 40px
          .i-right
            text-align: left
          .icon-favorite
            color: $color-sub-theme
      &.normal-enter-active, &.normal-leave-active
        transition: all 0.4s
        .top, .bottom
          transition: all 0.4s cubic-bezier(0.86, 0.18, 0.82, 1.32)
      &.normal-enter, &.normal-leave-to
        opacity: 0
        .top
          transform: translate3d(0, -100px, 0)
        .bottom
          transform: translate3d(0, 100px, 0)
    .mini-player
      display: flex
      align-items: center
      position: fixed
      left: 0
      bottom: 0
      z-index: 180
      width: 100%
      height: 60px
      background: $color-highlight-background
      &.mini-enter-active, &.mini-leave-active
        transition: all 0.4s
      &.mini-enter, &.mini-leave-to
        opacity: 0
      .icon
        flex: 0 0 40px
        width: 40px
        padding: 0 10px 0 20px
        img
          border-radius: 50%
          &.play
            animation: rotate 10s linear infinite
          &.pause
            animation-play-state: paused
      .text
        display: flex
        flex-direction: column
        justify-content: center
        flex: 1
        line-height: 20px
        overflow: hidden
        .name
          margin-bottom: 2px
          no-wrap()
          font-size: $font-size-medium
          color: $color-text
        .desc
          no-wrap()
          font-size: $font-size-small
          color: $color-text-d
      .control
        flex: 0 0 30px
        width: 30px
        padding: 0 10px
        .icon-play-mini, .icon-pause-mini, .icon-playlist
          font-size: 30px
          color: $color-theme-d
        .icon-mini
          font-size: 32px
          position: absolute
          left: 0
          top: 0
          
  @keyframes rotate
    0%
      transform: rotate(0)
    100%
      transform: rotate(360deg)
</style>
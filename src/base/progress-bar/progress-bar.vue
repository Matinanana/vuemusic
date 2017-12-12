<template>
  <div class="progress-bar" ref="progressBar" @click="progressClick">
    <div class="bar-inner">
      <div class="progress" ref="progress"></div>
      	<!--.prevent阻止游览器默认行为-->
      <div class="progress-btn-wrapper" ref="progressBtn" 
      	@touchstart.prevent="progressTouchStart" 
      	@touchmove.prevent="progressTouchMove" 
      	@touchend.prevent="progressTouchEnd" 
      	>
        <div class="progress-btn"></div>
      </div>
    </div>
  </div>
</template>

<script type="text/ecmascript-6">
	import {prefixStyle} from 'common/js/dom'
	
	const progressBtnWidth=16//进度条按钮的宽度
	const transform=prefixStyle('transform')
	
	export default{
		props:{
	  		percent:{//百分比
					type:Number,
					default:0
				}
		},
		created(){
			this.touch={}//touch对象
		},
		methods:{
			progressTouchStart(e){
				this.touch.initiated=true//给this.touch一个标志位，初始化未true
				this.touch.startX=e.touches[0].pageX//记录第一个手指点击的位置
				this.touch.left=this.$refs.progress.clientWidth//点击正在播放进度条的宽度
			},
			progressTouchMove(e){
				if(!this.touch.initiated){
					return
				}
				//手指点击移动偏移量
				const deltax=e.touches[0].pageX-this.touch.startX
				//进度条移动的偏移量
				const offsetWidth=Math.min(this.$refs.progressBar.clientWidth-progressBtnWidth,
				Math.max(0,this.touch.left+deltax))
				this._offset(offsetWidth)//实现拖动
			},
			progressTouchEnd(){
				this.touch.initiated=false
				this._triggerPercent()//拖动的百分比
			},
			progressClick(e){//点击事件 点击进度条时
				//getBoundingClientRect用这个方法可以获取到页面最左边到progressBar的宽度
				const rect=this.$refs.progressBar.getBoundingClientRect()
				const offsetWidth=e.pageX-rect.left//获取播放进度条长度
				this._offset(offsetWidth)
				
//				this._offset(e.offsetX)会导致多次点击圆点偏移位置不对，所以使用pageX
				this._triggerPercent()
			},
			_triggerPercent(){//计算拖动的百分比
	  		const barWidth=this.$refs.progressBar.clientWidth-progressBtnWidth
				const percent =this.$refs.progress.clientWidth/barWidth
				this.$emit('percentChange',percent)//派发percentChange事件
			},
			_offset(offsetWidth){//实现x轴的拖动
				//播放条长度
	  		this.$refs.progress.style.width=`${offsetWidth}px`
	  		//小球的偏移
	  		this.$refs.progressBtn.style[transform]=`translate3d(${offsetWidth}px,0,0)`
			}
		},
		watch:{//监听percent变化
	  		percent(newPercent){
	  			if(newPercent>=0&&!this.touch.initiated){//进度条大于等于0，没有被拖动的时候
	  				//进度条总长度
	  				const barWidth=this.$refs.progressBar.clientWidth-progressBtnWidth
	  				const offsetWidth=newPercent*barWidth//播放比例
						this._offset(offsetWidth)
	  			}
	  		}
	  	}
	}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"

  .progress-bar
    height: 30px
    .bar-inner
      position: relative
      top: 13px
      height: 4px
      background: rgba(0, 0, 0, 0.3)
      .progress
        position: absolute
        height: 100%
        background: $color-theme
      .progress-btn-wrapper
        position: absolute
        left: -8px
        top: -13px
        width: 30px
        height: 30px
        .progress-btn
          position: relative
          top: 7px
          left: 7px
          box-sizing: border-box
          width: 16px
          height: 16px
          border: 3px solid $color-text
          border-radius: 50%
          background: $color-theme
</style>
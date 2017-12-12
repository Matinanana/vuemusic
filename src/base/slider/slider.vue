<!--轮播图组件-->
<template>
  <div class="slider" ref="slider">
    <div class="slider-group" ref="sliderGroup">
    	<!--slot插槽:用于标记往哪个具名插槽中插入子组件内容-->
      <slot>
      </slot>
    </div>
    <!--dots表示有几个圆点-->
    <div class="dots">
    	<span class="dot" v-for="(item,index) in dots" :class="{active:currentPageIndex===index}"></span>
    </div>
  </div>
</template>

<script type="text/ecmascript-6">
	import BScroll from 'better-scroll' //移动端滚动第三方插件
	import { addClass } from 'common/js/dom'

export default {
	data() {
		return {
			dots: [], //圆点
			currentPageIndex: 0 //当前第几个轮播图
		}
	},
	props: { //外部控制这个组件，设置这个组件有哪些属性
		loop: { //是否循环轮播
			type: Boolean, //类型
			default: true //默认
		},
		autoPlay: { //是否自动轮播
			type: Boolean,
			default: true
		},
		interval: { //轮播时间间隔
			type: Number,
			default: 4000
		}
	},
	mounted() {
		//保证dom成功渲染的话，需要加一个延时，
		//浏览器的刷新一般是17ms,这里用20ms
		setTimeout(() => {
			this._setSliderWidth()
			this._initDots()
			this._initSlider()

			if(this.autoPlay) {
				this._play()
			}
		}, 20)

		//监听窗口改变事件（优化功能自动改变适配器宽度）
		window.addEventListener('resize', () => {
			if(!this.slider) {
				return
			}
			this._setSliderWidth(true)
			this.slider.refresh()
		})

	},
	methods: {
		_setSliderWidth(isResize) { //设置slider的宽度
			this.children = this.$refs.sliderGroup.children //获取到子元素
			//这个照片为5个，dots的数量要与它保持一致
			//				console.log(this.children.length)

			let width = 0
			let sliderWidth = this.$refs.slider.clientWidth //获取到父容器slider宽度
			for(let i = 0; i < this.children.length; i++) {
				let child = this.children[i] //获取到每一个子元素
				addClass(child, 'slider-item')
				child.style.width = sliderWidth + 'px' //每一个子元素等于父容器slider宽度
				width += sliderWidth //sliderGroup总宽度
			}
			if(this.loop && !isResize) { //无缝自动轮播,会克隆左右两边的dom所以,要2个宽度;,如果是isresize过来的 就不需要加了
				width += 2 * sliderWidth
			}
			this.$refs.sliderGroup.style.width = width + 'px'
		},
		_initDots() { //圆点
			this.dots = new Array(this.children.length)
		},
		_initSlider() { //初始化slider，会多出两个图片（黑色）
			this.slider = new BScroll(this.$refs.slider, {
				scrollX: true, //x轴轮播
				scrollY: false,
				momentum: false, //当快速滑动时是否开启滑动惯性
				snap:{
					loop:this.loop, //无缝循环轮播
					threshod:0.3, //用手指滑动时页面可以切换的阈值
					speed:400//轮播图切换的动画时间
				} 
			})
			//当滚动完后，给slider绑定一个事件
			this.slider.on('scrollEnd', () => {
				//获取滚动完后元素的下标
				let pageIndex = this.slider.getCurrentPage().pageX
//				console.log(pageIndex) //0，1，2，3，4，5，6
					if(this.loop){
						//循环播放时，前后都会自动加一个子元素
						pageIndex-=1
					}
				this.currentPageIndex = pageIndex
				if(this.autoPlay) { //用手拖动时，要清除定时再轮播
					clearTimeout(this.timer)
					this._play()
				}
			})
		},
		_play() {
			let pageIndex = this.currentPageIndex + 1
			if(this.loop) {
				pageIndex += 1
			}
			this.timer = setTimeout(() => {
				//3个参数：去哪一页x轴，y轴，轮播事件间隔
				this.slider.goToPage(pageIndex, 0, 400)
			}, this.interval)
		}
	},
	destroyed(){//切换页面结束定时器
		clearTimeout(this.timer)
	}
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"

  .slider
    min-height: 1px
    .slider-group
      position: relative
      overflow: hidden
      white-space: nowrap
      .slider-item
        float: left
        box-sizing: border-box
        overflow: hidden
        text-align: center
        a
          display: block
          width: 100%
          overflow: hidden
          text-decoration: none
        img
          display: block
          width: 100%
    .dots
      position: absolute
      right: 0
      left: 0
      bottom: 12px
      text-align: center
      font-size: 0
      .dot
        display: inline-block
        margin: 0 4px
        width: 8px
        height: 8px
        border-radius: 50%
        background: $color-text-l
        &.active
          width: 20px
          border-radius: 5px
          background: $color-text-ll
</style>
<template>
	<scroll class="listview" 
		:data="data" 
		ref="listview" 
		:listenScroll="listenScroll" 
		:probeType="probeType" 
		@scroll="scroll">
		<ul>
			<li v-for="group in data" class="list-group" ref="listGroup">
				<h2 class="list-group-title">{{group.title}}</h2>
				<ul>
					<!--@click="selectItem(item)添加点击事件-->
					<li @click="selectItem(item)" v-for="item in group.items" class="list-group-item">
						<img v-lazy="item.avatar" class="avatar" />
						<span class="name">{{item.name}}</span>
					</li>
				</ul>
			</li>
		</ul>
		<!--stop.prevent:防止事件冒泡-->
		<div class="list-shortcut" 
			@touchstart="onShortcutTouchStart" 
			@touchmove.stop.prevent="onShortcutTouchMove">
			<ul>
				<li v-for="(item,index) in shortcutList" 
					class="item" 
					:class="{'current':currentIndex===index}" 
					:data-index = "index">
					{{item}}
				</li>
			</ul>
		</div>
		<!---滚动固定标题实现-->
		<div class="list-fixed" v-show="fixedTitle" ref="fixed">
			<h1 class="fixed-title">{{fixedTitle}}</h1>
		</div>
	</scroll>
</template>

<script type="text/ecmascript-6">
	import Scroll from 'base/scroll/scroll'
	import {getData} from 'common/js/dom'
	
	const ANCHOR_HEIGHT=18//右侧列表各字母之间的距离
	const TITLE_HEIGHT=30//固定标题的高度
	export default{
		created(){
			//将touch写在created里面是因为不需要去观测touch的变化
			//是为了让函数之间可以获取到这个数据
			this.touch={}
			this.listenScroll=true//是否监听滚动位置事件
			this.listHeight=[]//高度初始化
			this.probeType=3//设置为3时才能实时监测滚动事件
			//props,data的里面东西，都会被vue去添加一个set和get事件，
			//会去观测props,data,computed里面值的变化，对它做一个监听，
			//主要是为了跟dom做数据绑定来用的
		},
		data(){
			return{
				scrollY:-1,//观测实时滚动的y轴
				currentIndex:0, //高亮索引值
				diff:-1//顶部固定标题与下面固定标题之间的滚动差
			}
		},
		props:{
			data:{
				type:Array,
				default:[]
			}
		},
		computed:{
			shortcutList(){//获取右边列表：热，A,B,C...
				return this.data.map((group)=>{
					return group.title.substr(0,1)
				})
			},
			fixedTitle(){//获取滚动固定标题
				//如果scrollY大于0 就不显示滚动固定标题
				if(this.scrollY>0){
					return ''
				}
				//因为刚开始初始化为空，所以这里需要判断一下
				return this.data[this.currentIndex]?this.data[this.currentIndex].title:''
			}
		},
		methods:{
			refresh(){
				this.$refs.listview.refresh()
			},
			selectItem(item){//传递歌手信息item
				this.$emit('select',item)
			},
			onShortcutTouchStart(e){//点击右侧列表字母，移动到相应歌手列表位置
				let anchorIndex=getData(e.target,'index')//获取到点击右侧字母的index
				let firstTouch=e.touches[0]//touches[0]：第一个手指触碰的位置
				this.touch.y1=firstTouch.pageY//记录当前y轴值
				this.touch.anchorIndex=anchorIndex//记录当前索引值
				this._scrollTo(anchorIndex)
//				console.log(anchorIndex)
			},
			onShortcutTouchMove(e){//计算滚动位置
				let firstTouch=e.touches[0]
				this.touch.y2=firstTouch.pageY
				//计算偏移量,用y2-y1的偏移量除18，大于1说明移动了一个字母，以此类推取整
				let delta=(this.touch.y2-this.touch.y1)/ANCHOR_HEIGHT|0   
//				console.log(delta)
				//anchorIndex是字符串需要转化
				let anchorIndex=parseInt(this.touch.anchorIndex)+delta
				this._scrollTo(anchorIndex)
			},
			scroll(pos){//实时获取滚动位置y轴
//				console.log(pos)
				this.scrollY=pos.y
			},
			_scrollTo(index){
				//因为右侧列表顶部和底部分别有两个空白的样式，当点击它时，时 无效的
				if(!index&&index!==0){
					return
				}
				//处理index的边界情况：滑动到最上面高亮会显示在最后一个字母上
				if(index<0){
					index=0
				}
				else if(index>this.listHeight.length-2){
					index=this.listHeight.length-2
				}
				//将点击右侧字母的index，传递给listview歌手列表，跳转到相应index位置
				this.$refs.listview.scrollToElement(this.$refs.listGroup[index],0)
				//点击右侧显示高亮
				this.scrollY=-this.listHeight[index]
//				console.log(this.scrollY)
			},
			_calculateHeght(){//data发现变化时 计算每个 group的高度
				this.listHeight=[]
				const list=this.$refs.listGroup
				//遍历每个listGroup的高度
				let height=0
				this.listHeight.push(height)
				for(let i=0;i<list.length;i++){
					let item=list[i]
					height+=item.clientHeight
					this.listHeight.push(height)
				}
//				console.log(this.listHeight)
			}
		},
		watch:{//监听data的变化
			data(){
				//数据的变化到dom的变化是有延时，当dom渲染完后 再计算高度
				setTimeout(()=>{
					this._calculateHeght()
				},20)
				
			},
			scrollY(newY){//scrolly与listHeight进行比较，落在哪个区域里
				const listHeight=this.listHeight
				//当滚动到顶部时，newY>0
				if(newY>0){
					this.currentIndex=0
					return
				}
				//在中间部分滚动
				for(let i=0;i<listHeight.length-1;i++){
					let height1=listHeight[i]
					let height2=listHeight[i+1]
					//当往下移动时，newY为负值
					if(-newY>=height1&&-newY<height2){
						this.currentIndex=i
						this.diff=height2+newY//计算两固定标题差值
						return
					}
				}
				//当滚动到底部，且-newY大于最后一个元素的上限
				//CSS样式 给我们多画了一个空的 样式
				this.currentIndex=listHeight.length-2
			},
			diff(newVal){//监听固定标题之间差值
				let fixedTop=(newVal>0&&newVal<TITLE_HEIGHT)?newVal-TITLE_HEIGHT:0
				if(this.fixedTop===fixedTop){
					return
				}
				this.fixedTop=fixedTop
				this.$refs.fixed.style.transform=`translate3d(0,${fixedTop}px,0)`
			}
		},
		components:{
			Scroll
		}
	}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"

  .listview
    position: relative
    width: 100%
    height: 100%
    overflow: hidden
    background: $color-background
    .list-group
      padding-bottom: 30px
      .list-group-title
        height: 30px
        line-height: 30px
        padding-left: 20px
        font-size: $font-size-small
        color: $color-text-l
        background: $color-highlight-background
      .list-group-item
        display: flex
        align-items: center
        padding: 20px 0 0 30px
        .avatar
          width: 50px
          height: 50px
          border-radius: 50%
        .name
          margin-left: 20px
          color: $color-text-l
          font-size: $font-size-medium
    .list-shortcut
      position: absolute
      z-index: 30
      right: 0
      top: 50%
      transform: translateY(-50%)
      width: 20px
      padding: 20px 0
      border-radius: 10px
      text-align: center
      background: $color-background-d
      font-family: Helvetica
      .item
        padding: 3px
        line-height: 1
        color: $color-text-l
        font-size: $font-size-small
        &.current
          color: $color-theme
    .list-fixed
      position: absolute
      top: 0
      left: 0
      width: 100%
      .fixed-title
        height: 30px
        line-height: 30px
        padding-left: 20px
        font-size: $font-size-small
        color: $color-text-l
        background: $color-highlight-background
    .loading-container
      position: absolute
      width: 100%
      top: 50%
      transform: translateY(-50%)
</style>

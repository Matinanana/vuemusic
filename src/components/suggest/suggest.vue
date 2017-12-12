<template>
  <scroll class="suggest" 
  	:data="result"
  	:pullup="pullup"
  	:beforeScroll="beforeScroll"
  	@scrollToEnd="searchMore"
  	@beforeScroll="listScroll"
  	ref="suggest"
  	>
    <ul class="suggest-list">
      <li @click="selectItem(item)" class="suggest-item" v-for="item in result">
        <div class="icon">
          <i :class="getIconCls(item)"></i>
        </div>
        <div class="name">
          <p class="text" v-html="getDisplayName(item)"></p>
        </div>
      </li>
      <loading v-show="hasMore" title=""></loading>
    </ul>
    <div v-show="!hasMore&&!result.length" class="no-result-wrapper">
    	<no-result title="抱歉，暂无搜索结果"></no-result>
    </div>
  </scroll>
</template>

<script type="text/ecmascript-6">
  import {search} from 'api/search'
  import {ERR_OK} from 'api/config'
  import {createSong} from 'common/js/song'
  import Scroll from 'base/scroll/scroll'
  import Loading from 'base/loading/loading'
  import Singer from 'common/js/singer'
  import {mapMutations,mapActions} from 'vuex'
  import NoResult from 'base/no-result/no-result'
  
  const TYPE_SINGER='singer'//类型设置为singer
  const perpage=20
  
  export default{
  	props:{
  		query:{//检索词
  			type:String,
  			default:''
  		},
  		showSinger:{//检索关键词显示歌手信息
  			type:Boolean,
  			default:true
  		}
  	},
  	data(){
  		return {
  			page:1,//相关信息检索页
  			result:[],//获取到的数据放在数组里面
  			pullup:true,//上拉刷新
  			hasMore:true,//标志位：是否有更多数据
  			beforeScroll:true
  		}
  	},
  	methods:{
  		search(){//获取检索词相关数据
  			//每次重新搜索时，页数初始化为1
  			this.page=1
  			//每次重新搜索时,滚动位置初始化未0
  			this.$refs.suggest.scrollTo(0,0)
  			this.hasMore=true
  			search(this.query,this.page,this.showSinger,perpage).then((res)=>{
  				if(res.code===ERR_OK){
  					//获取到数据
  					this.result=this._genResult(res.data)
  					//检查是否有更多的数据
  					this._checkMore(res.data)
  				}
  			})
  		},
  		searchMore(){//滚动到底部时，获取更多数据
  			if(!this.hasMore){//如果不存在更多数据
  				return
  			}
  			this.page++ //页数加一
  			//获取更多数据
  			search(this.query,this.page,this.showSinger,perpage).then((res)=>{
  				if(res.code===ERR_OK){
  					this.result=this.result.concat(this._genResult(res.data))
  					this._checkMore(res.data)
  				}
  			})
  		},
  		getIconCls(item){//设置class为歌手图标还是歌曲图标
  			if(item.type===TYPE_SINGER){
  				return 'icon-mine'
  			}else{
  				return 'icon-music'
  			}
  		},
  		getDisplayName(item){//显示检索词相关数据
  			//如果有歌手zhida信息
  			if(item.type===TYPE_SINGER){
  				return item.singername
  			}else{
  				return `${item.name}-${item.singer}`
  			}
  		},
  		selectItem(item){//点击事件
  			if(item.type===TYPE_SINGER){
  				const singer=new Singer({
  					id:item.singermid,
  					name:item.singername
  				})
  				this.$router.push({
  					path:`/search/${singer.id}`
  				})
  				this.setSinger(singer)
  			}else{
  				this.insertSong(item)
  			}
  			this.$emit('select')
  		},
  		listScroll(){//刚开始滚动时
  			this.$emit('listScroll')
  		},
  		refresh(){
  			this.$refs.suggest.refresh()
  		},
  		_checkMore(data){//检查是否有更多的数据
  			const song=data.song
  			if(!song.list.length||(song.curnum+song.curpage*perpage)>=song.totainum){
  				this.hasMore=false
  			}
  		},
  		_genResult(data){//获取数据存在zhida以singer+song排序
  			let ret=[]
  			//检索词相关数据如果有zhida就是有歌手信息
  			//将歌手信息排在最前面
  			if(data.zhida&&data.zhida.singerid){
  				//加上type,是为了区分歌手信息和歌曲信息
  				ret.push({...data.zhida,...{type:TYPE_SINGER}})
  			}
  			//如果有歌曲信息
  			if(data.song){
  				ret=ret.concat(this._normalizeSongs(data.song.list))
  			}
  			return ret
  		},
  		_normalizeSongs(list){//遍历song
  			let ret=[]
  			list.forEach((musicData)=>{
  				if(musicData.songid&&musicData.albumid){
  					ret.push(createSong(musicData))
  				}
  			})
  			return ret
  		},
  		...mapMutations({
				setSinger:'SET_SINGER' //映射方法名
			}),
			...mapActions([
				'insertSong'
			])
  	},
  	watch:{
  		query(){
  			this.search()
  		}
  	},
  	components:{
  		Scroll,
  		Loading,
  		NoResult
  	}
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .suggest
    height: 100%
    overflow: hidden
    .suggest-list
      padding: 0 30px
      .suggest-item
        display: flex
        align-items: center
        padding-bottom: 20px
      .icon
        flex: 0 0 30px
        width: 30px
        [class^="icon-"]
          font-size: 14px
          color: $color-text-d
      .name
        flex: 1
        font-size: $font-size-medium
        color: $color-text-d
        overflow: hidden
        .text
          no-wrap()
    .no-result-wrapper
      position: absolute
      width: 100%
      top: 50%
      transform: translateY(-50%)
</style>
import {mapGetters,mapMutations,mapActions} from 'vuex'
import {playMode} from 'common/js/config'
import {shuffle} from 'common/js/util'

export const playlistMixin={
	computed:{
		...mapGetters([
			'playlist'
		])
	},
	mounted(){
		this.handlePlaylist(this.playlist)
	},
	activated(){
		this.handlePlaylist(this.playlist)
	},
	watch:{
		playlist(newVal){
			this.handlePlaylist(newVal)
		}
	},
	methods:{
		handlePlaylist(){
			throw new Error('component must implement handlePlaylist method')
		}
	}
}

export const playerMixin={
	computed:{
		iconMode(){//播放类型
			return this.mode===playMode.sequence?'icon-sequence':this.mode===playMode.loop?'icon-loop':'icon-random'
		},
      	...mapGetters([
	      	'sequenceList',
	      	'currentSong',
	      	'playlist',
	      	'mode',
	      	'favoriteList'
	     ])
	},
	methods:{
		changeMode(){//点击播放类型事件
			const mode=(this.mode+1)%3
			this.setPlayMode(mode)
			let list=null
			if(mode===playMode.random){//随机播放
				list=shuffle(this.sequenceList)//打乱播放列表顺序
			}else{//顺序播放
				list=this.sequenceList
			}
			this.resetCurrentIndex(list)//重置当前播放歌曲的索引
			this.setPlaylist(list)
		},
		resetCurrentIndex(list){//重置当前播放歌曲的索引
			let index=list.findIndex((item)=>{
				return item.id===this.currentSong.id
			})
			this.setCurrentIndex(index)
		},
		toggleFavorite(song){//点击喜欢按钮
	      if (this.isFavorite(song)){
	        this.deleteFavoriteList(song)
	      } else {
	        this.saveFavoriteList(song)
	      }
	    },
		getFavoriteIcon(song){//设置喜欢的class
	      if (this.isFavorite(song)){
	        return 'icon-favorite'
	      }
	      return 'icon-not-favorite'
	    },
	    isFavorite(song){//判断这个歌曲是否在喜欢列表中
	      const index=this.favoriteList.findIndex((item)=>{
	        return item.id===song.id
	      })
	      return index>-1
	    },
		...mapMutations({
			setPlayingState:'SET_PLAYING_STATE',
			setCurrentIndex:'SET_CURRENT_INDEX',
			setPlayMode:'SET_PLAY_MODE',
			setPlaylist:'SET_PLAYLIST'
		}),
		 ...mapActions([
		      'saveFavoriteList',
		      'deleteFavoriteList'
		    ])
	}
}

export const searchMixin={
	data(){
		return {
			query:'',//检索词
			refreshDelay:100
		}
	},
	computed:{
		...mapGetters([
			'searchHistory'
		])
	},
	methods:{
		blurInput(){//滚动时，手机键盘最小化
			this.$refs.searchBox.blur()
		},
		saveSearch(){//保存搜索历史
			this.saveSearchHistory(this.query)
		},
		onQueryChange(query){//获取搜索框的检索词
			this.query=query
		},
		addQuery(query){//热门搜索点击事件，点击添加到搜索框中
			this.$refs.searchBox.setQuery(query)
		},
		...mapActions([
			'saveSearchHistory',
			'deleteSearchHistory'
		])
	}
}

//状态
import {playMode} from 'common/js/config'
import {loadSearch,loadPlay,loadFavorite} from 'common/js/cache'

const state={
	singer:{},
	playing:false,
	fullScreen:false,//播放页面是否全屏
	playlist:[],//播放列表
	sequenceList:[],//顺序播放列表
	mode:playMode.sequence,//播放模式
	currentIndex:-1,//当前播放的索引
	disc:{},
	topList:{},
	searchHistory:loadSearch(),//搜索历史
	playHistory:loadPlay(),//播放历史
	favoriteList: loadFavorite() //喜欢列表
}

export default state
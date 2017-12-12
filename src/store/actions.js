//异步操作，异步修改，对mutation做一些封装
import * as types from './mutation-types'
import {playMode} from 'common/js/config'
import {shuffle} from 'common/js/util'
import {saveSearch,deleteSearch,clearSearch,savePlay,saveFavorite,deleteFavorite} from 'common/js/cache'

function findIndex(list,song){
	return list.findIndex((item)=>{
		return item.id===song.id
	})
}

export const selectPlay=function({commit,state},{list,index}){//选择播放 commit方法，state属性，list,index对象
	//提交
	commit(types.SET_SEQUENCE_LIST,list)
	if(state.mode===playMode.random){//随机播放
		let randomList=shuffle(list)
		commit(types.SET_PLAYLIST,randomList)
		index=findIndex(randomList,list[index])
	}else{
		commit(types.SET_PLAYLIST,list)
	}
	commit(types.SET_CURRENT_INDEX,index)
	commit(types.SET_FULL_SCREEN,true)
	commit(types.SET_PLAYING_STATE,true)
}

export const randomPlay=function({commit},{list}){
	commit(types.SET_PLAY_MODE,playMode.random)
	commit(types.SET_SEQUENCE_LIST,list)
	let randomList=shuffle(list)
	commit(types.SET_PLAYLIST,randomList)
	commit(types.SET_CURRENT_INDEX,0)
	commit(types.SET_FULL_SCREEN,true)
	commit(types.SET_PLAYING_STATE,true)
}

export const insertSong=function({commit,state},song){
	let playlist=state.playlist.slice()
	let sequenceList=state.sequenceList.slice()
	let currentIndex=state.currentIndex
	//记录当前歌曲
	let currentSong=playlist[currentIndex]
	
	//查找当前列表中是否有待插入的歌曲并返回其索引
	let fpIndex=findIndex(playlist,song)
	//因为是插入歌曲所以索引+1
	currentIndex++
	//插入这首歌到当前索引位置
	playlist.splice(currentIndex,0,song)
	//如果已经包含了这首歌
	if(fpIndex>-1){
		//如果当前插入的序号大于列表中的序号
		if(currentIndex>fpIndex){
			playlist.splice(fpIndex,1)
			currentIndex--
		}else{
			playlist.splice(fpIndex+1,1)
		}
	}
	let currentSIndex=findIndex(sequenceList,currentSong)+1
	let fsIndex=findIndex(sequenceList,song)
	sequenceList.splice(currentIndex,0,song)
	
	if(fsIndex>-1){
		if(currentIndex>fsIndex){
			sequenceList.splice(fpIndex,1)
		}else{
			sequenceList.splice(fpIndex+1,1)
		}
	}
	
	commit(types.SET_PLAYLIST,playlist)
	commit(types.SET_SEQUENCE_LIST,sequenceList)
	commit(types.SET_CURRENT_INDEX,currentIndex)
	commit(types.SET_FULL_SCREEN,true)
	commit(types.SET_PLAYING_STATE,true)
}
//保存历史记录
export const saveSearchHistory=function({commit},query){
	commit(types.SET_SEARCH_HISTORY,saveSearch(query))
}
//删除某条历史记录
export const deleteSearchHistory=function({commit},query){
	commit(types.SET_SEARCH_HISTORY,deleteSearch(query))
}
//删除所有历史记录
export const clearSearchHistory=function({commit}){
	commit(types.SET_SEARCH_HISTORY,clearSearch())
}
//删除歌曲列表中的某个歌曲
export const deleteSong=function({commit,state},song){
	let playlist=state.playlist.slice()
	let sequenceList=state.sequenceList.slice()
	let currentIndex=state.currentIndex
	let pIndex=findIndex(playlist,song)
	playlist.splice(pIndex,1)
	let sIndex=findIndex(sequenceList,song)
	sequenceList.splice(sIndex,1)
	
	if(currentIndex>pIndex||currentIndex===playlist.length){
		currentIndex--
	}
	commit(types.SET_PLAYLIST,playlist)
	commit(types.SET_SEQUENCE_LIST,sequenceList)
	commit(types.SET_CURRENT_INDEX,currentIndex)
	const platingState=playlist.length>0
	commit(types.SET_PLAYING_STATE,platingState)
	
}

//清空播放列表
export const deleteSongList=function({commit}){
	commit(types.SET_CURRENT_INDEX, -1)
  	commit(types.SET_PLAYLIST, [])
  	commit(types.SET_SEQUENCE_LIST, [])
  	commit(types.SET_PLAYING_STATE, false)
}

//保存播放历史记录
export const savePlayHistory=function({commit},song){
	commit(types.SET_PLAY_HISTORY,savePlay(song))
}

//保存喜欢歌曲
export const saveFavoriteList = function ({commit}, song) {
  commit(types.SET_FAVORITE_LIST, saveFavorite(song))
}
//删除喜欢歌曲
export const deleteFavoriteList = function ({commit}, song) {
  commit(types.SET_FAVORITE_LIST, deleteFavorite(song))
}
//操作和storage相关的数据
//保存搜索结果
import storage from 'good-storage'

const SEARCH_KEY='__search__'
const SEARCH_MAX_LENGTH=15//最大存储空间

const PLAY_KEY='__PLAY__'
const PLAY_MAX_LENGTH=200

const FAVORITE_KEY='__favorite__'
const FAVORITE_MAX_LENTH=200

//插入数据封装一个方法 参数：数组，值，比较函数，最大长度
function insertArray(arr,val,compare,maxLen){
	const index=arr.findIndex(compare)
	if(index===0){//索引为0不做操作
		return
	}
	if(index>0){//索引大于0，需要删除这个值
		arr.splice(index,1)
	}
	//然后在数组最当前添加值
	arr.unshift(val)
	//判断是否存在最大长度，如果arr超过最大长度，就删除最后一个元素
	if(maxLen&&arr.length>maxLen){
		arr.pop()
	}
}

//删除数据封装一个方法 参数：数组，比较函数，
function deleteFromArray(arr,compare){
	const index=arr.findIndex(compare)
	if(index>-1){//删除
		arr.splice(index,1)
	}
	
}

export function saveSearch(query){//保存搜索历史
	let searches=storage.get(SEARCH_KEY,[])//当前列表
	insertArray(searches,query,(item)=>{
		//检测searches里面是否存在query
		return item===query
	},SEARCH_MAX_LENGTH)
	storage.set(SEARCH_KEY,searches)
	return searches
}

//本地缓存区读取searches
export function loadSearch(){
	return storage.get(SEARCH_KEY,[])
}

//删除某条历史记录操作
export function deleteSearch(query){
	let searches=storage.get(SEARCH_KEY,[])
	deleteFromArray(searches,(item)=>{
		return item===query
	})
	storage.set(SEARCH_KEY,searches)
	return searches
}

//删除操作
export function clearSearch(query){
	storage.remove(SEARCH_KEY)
	return []
}

//保存播放列表
export function savePlay(song){
	let songs=storage.get(PLAY_KEY,[])
	insertArray(songs,song,(item)=>{
		return item.id===song.id
	},PLAY_MAX_LENGTH)
	storage.set(PLAY_KEY,songs)
	return songs
}
//加载播放列表
export function loadPlay(){
	return storage.get(PLAY_KEY,[])
}

//保存喜欢歌曲到喜欢列表中
export function saveFavorite(song) {
  let songs = storage.get(FAVORITE_KEY, [])
  //插入到喜欢列表中
  insertArray(songs, song, (item) => {
    return song.id === item.id
  }, FAVORITE_MAX_LENTH)
  storage.set(FAVORITE_KEY, songs)
  return songs
}

//删除喜欢列表中的喜欢歌曲
export function deleteFavorite(song) {
  let songs = storage.get(FAVORITE_KEY, [])
  deleteFromArray(songs, (item) => {
    return item.id === song.id
  })
  storage.set(FAVORITE_KEY, songs)
  return songs
}

//加载喜欢列表
export function loadFavorite() {
  return storage.get(FAVORITE_KEY, [])
}
<template>
	<div class="singer" ref="singer">
		<list-view ref="list" @select="selectSinger" :data="singers"></list-view>
		<!--挂载子路由-->
		<router-view></router-view>
	</div>
</template>

<script>
	import {getSingerList} from 'api/singer'
	import {ERR_OK} from 'api/config'
	import Singer from 'common/js/singer'
	import ListView from 'base/listview/listview'
	import {mapMutations} from 'vuex' //vuex的语法糖mapMutations封装了Mutations
	import {playlistMixin} from 'common/js/mixin'
	
	const HOT_NAME='热门'
	const HOT_SINGER_LEN=10//取前十条热门数据
	export default{
		mixins:[playlistMixin],
		data(){
			return{
			singers:[]//歌手列表	
			}
		},
		created(){
			this._getSingerList()
		},
		methods:{
			handlePlaylist(playlist){
				const bottom=playlist.length>0?'60px':''
				this.$refs.singer.style.bottom=bottom
				this.$refs.list.refresh()
			},
			selectSinger(singer){
				this.$router.push({
					path:`/singer/${singer.id}`
				})
				//实现mutations提交
				this.setSinger(singer)
			},
			_getSingerList(){//获取歌手列表数据
				getSingerList().then((res)=>{
					if(res.code===ERR_OK){
						this.singers=this._normalizeSinger(res.data.list)
//						console.log(this.singers)
					}
				})
			},
			_normalizeSinger(list){//规范化请求数据方法
				let map={
					hot:{//热门
						title:HOT_NAME,//将title设置为热门
						items:[]	
					}
				}
				list.forEach((item,index)=>{//遍历歌手列表
					if(index<HOT_SINGER_LEN){//只取10 条热门数据
						map.hot.items.push(new Singer({
							id:item.Fsinger_mid,//歌手id
							name:item.Fsinger_name//歌手姓名
						}))
					}
					const key=item.Findex//歌手姓名首字母
					if(!map[key]){//如果上面定义的map没有key,歌手姓名首字母
						map[key]={
							title:key,//将title设置为名字首字母
							items:[]
						}
					}
					map[key].items.push(new Singer({
						id:item.Fsinger_mid,
						name:item.Fsinger_name
					}))
				})
//				console.log(map)
				//为了得到有序列表，我们需要处理map
				let hot=[]
				let ret=[]
				for (let key in map) {
					let val=map[key]
					if(val.title.match(/[a-zA-Z]/)){//正则校验
						ret.push(val)
					}
					else if(val.title===HOT_NAME){
						hot.push(val)
					}
				}
				//sort() 方法用于对数组的元素进行排序
				ret.sort((a,b)=>{//排序方法
					//charCodeAt()返回字符串第一个字符的 Unicode编码
					return a.title.charCodeAt(0)-b.title.charCodeAt(0)
				})
				return hot.concat(ret)
			},
			...mapMutations({
				setSinger:'SET_SINGER' //映射方法名
			})
		},
		components:{
			ListView
		}
	}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  .singer
    position: fixed
    top: 88px
    bottom: 0
    width: 100%
</style>
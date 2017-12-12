<template>
	<transition name="slide">
		<music-list :title="title" :bg-image="bgImage" :songs="songs"></music-list>
	</transition>
</template>

<script type="text/ecmascript-6">
	import {mapGetters} from 'vuex' //取数据
	import {getSingerDetail} from 'api/singer'//获取歌手信息
	import {ERR_OK} from 'api/config'
	import {createSong} from 'common/js/song'//获取歌曲信息
	import MusicList from 'components/music-list/music-list'
	
	export default{
		data(){
			return {
				songs:[]
			}
		},
		computed:{
			title(){
				return this.singer.name
			},
			bgImage(){
				return this.singer.avatar
			},
			...mapGetters([
				'singer'
			])
		},
		created(){
			this._getDetail()
//			console.log(this.singer)
		},
		methods:{
			_getDetail(){//获取歌手详情信息
				if(!this.singer.id){//当获取不到歌手id时，返回歌手页面
					this.$router.push('/singer')
				}
				getSingerDetail(this.singer.id).then((res)=>{
					if(res.code===ERR_OK){
//						console.log(res.data.list)
						this.songs=this._normalizeSongs(res.data.list)
//						console.log(this.songs)
					}
				})
			},
			_normalizeSongs(list){//获取歌曲信息
				let ret=[]
				list.forEach((item)=>{
					let {musicData}=item
					if(musicData.songid&&musicData.albummid){
						ret.push(createSong(musicData))
					}
				})
				return ret
			}
		},
		components:{
			MusicList
		}
	}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  .slide-enter-active, .slide-leave-active
    transition: all 0.3s

  .slide-enter, .slide-leave-to
    transform: translate3d(100%, 0, 0)
</style>
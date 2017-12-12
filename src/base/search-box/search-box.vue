<template>
  <div class="search-box">
    <i class="icon-search"></i>
    <input ref="query" class="box" v-model="query" :placeholder="placeholder"/>
    <i @click="clear" v-show="query" class="icon-dismiss"></i>
  </div>
</template>

<script type="text/ecmascript-6">
	import {debounce} from 'common/js/util'
  export default {
   props:{
   	placeholder:{
   		type:String,
   		default:'搜索歌曲、歌手'
   	}
   },
   data(){
   	return {
   		query:''//检索词
   	}
   },
   methods:{
   	clear(){//点击删除按钮清空搜索框
   		this.query=''
   	},
   	setQuery(query){//添加接口
   		this.query=query
   	},
   	blur(){
   		this.$refs.query.blur()
   	}
   },
   created(){
   	this.$watch('query',debounce((newQuery)=>{//监听query
   		this.$emit('query',newQuery)
   	},200))
   }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"

  .search-box
    display: flex
    align-items: center
    box-sizing: border-box
    width: 100%
    padding: 0 6px
    height: 40px
    background: $color-highlight-background
    border-radius: 6px
    .icon-search
      font-size: 24px
      color: $color-background
    .box
      flex: 1
      margin: 0 5px
      line-height: 18px
      background: $color-highlight-background
      color: $color-text
      font-size: $font-size-medium
      &::placeholder
        color: $color-text-d
    .icon-dismiss
      font-size: 16px
      color: $color-background
</style>
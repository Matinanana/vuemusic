var express = require('express')
var config = require('./config/index')
var axios = require('axios')

var port = process.env.PORT || config.build.port

const app = express()

//*********************推荐页面歌单请求数据*************************************************************
var apiRoutes=express.Router()//创建一个router
//进行get请求
apiRoutes.get('/getDiscList',function(req,res){//自己定义一个方法/getDiscList
	let url='https://c.y.qq.com/splcloud/fcgi-bin/fcg_get_diss_by_tag.fcg'
	axios.get(url,{//axios的get请求，不懂看axios的用法
		headers:{
			referer:'https://c.y.qq.com/',
			host:'c.y.qq.com'
		},
		params:req.query//浏览器请求'/getDiscList'所带来的参数，然后再传入url这个地址
	}).then((response)=>{//这里的response指的是QQ音乐的response就是url地址的response
		res.json(response.data)//输出给浏览器端 url地址的data给'/getDiscList'的res
	}).catch((e)=>{//错误提示
		console.log(e)
	})
})

//************歌单详情页请求数据***************
//进行get请求
apiRoutes.get('/getSongList',function(req,res){
	let url='https://c.y.qq.com/qzone/fcg-bin/fcg_ucc_getcdinfo_byids_cp.fcg'
	axios.get(url,{//axios的get请求，不懂看axios的用法
		headers:{
			referer:'https://c.y.qq.com/',
			host:'c.y.qq.com'
		},
		params:req.query
	}).then((response)=>{//这里的response指的是QQ音乐的response就是url地址的response
		res.json(response.data)
	}).catch((e)=>{//错误提示
		console.log(e)
	})
})
//************************************

//************歌词请求数据***************
//进行get请求
apiRoutes.get('/lyric',function(req,res){
	let url='https://c.y.qq.com/lyric/fcgi-bin/fcg_query_lyric_new.fcg'
	axios.get(url,{//axios的get请求，不懂看axios的用法
		headers:{
			referer:'https://c.y.qq.com/',
			host:'c.y.qq.com'
		},
		params:req.query//浏览器请求'/lyric'所带来的参数，然后再传入url这个地址
	}).then((response)=>{//这里的response指的是QQ音乐的response就是url地址的response
		var ret=response.data
		if(typeof ret==='string'){
			var reg=/^\w+\(({[^()]+})\)$/ //正则表达式 转化为json格式
			var matches=ret.match(reg)
			if(matches){
				ret=JSON.parse(matches[1])
			}
		}
		res.json(ret)//输出给浏览器端 url地址的data给'/lyric'的res
	}).catch((e)=>{//错误提示
		console.log(e)
	})
})
//************************************

app.use('/api',apiRoutes)
//***********************************************************************************************


app.use(express.static('./dist'))

module.exports=app.listen(port,function(err){
  if(err){
    console.log(err)
    return
  }
  console.log('Listening at http://localhost:'+port+'\n')
})
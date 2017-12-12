'use strict'
require('./check-versions')()

const config = require('../config')
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = JSON.parse(config.dev.env.NODE_ENV)
}

const opn = require('opn')
const path = require('path')
const express = require('express')
const webpack = require('webpack')
const proxyMiddleware = require('http-proxy-middleware')
const webpackConfig = require('./webpack.dev.conf')

//**********************引入axios****************************************************************
var axios=require('axios')
//***********************************************************************************************

// default port where dev server listens for incoming traffic
const port = process.env.PORT || config.dev.port
// automatically open browser, if not set will be false
const autoOpenBrowser = !!config.dev.autoOpenBrowser
// Define HTTP proxies to your custom API backend
// https://github.com/chimurai/http-proxy-middleware
const proxyTable = config.dev.proxyTable

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


const compiler = webpack(webpackConfig)

const devMiddleware = require('webpack-dev-middleware')(compiler, {
  publicPath: webpackConfig.output.publicPath,
  quiet: true
})

const hotMiddleware = require('webpack-hot-middleware')(compiler, {
  log: false,
  heartbeat: 2000
})
// force page reload when html-webpack-plugin template changes
// currently disabled until this is resolved:
// https://github.com/jantimon/html-webpack-plugin/issues/680
// compiler.plugin('compilation', function (compilation) {
//   compilation.plugin('html-webpack-plugin-after-emit', function (data, cb) {
//     hotMiddleware.publish({ action: 'reload' })
//     cb()
//   })
// })

// enable hot-reload and state-preserving
// compilation error display
app.use(hotMiddleware)

// proxy api requests
Object.keys(proxyTable).forEach(function (context) {
  const options = proxyTable[context]
  if (typeof options === 'string') {
    options = { target: options }
  }
  app.use(proxyMiddleware(options.filter || context, options))
})

// handle fallback for HTML5 history API
app.use(require('connect-history-api-fallback')())

// serve webpack bundle output
app.use(devMiddleware)

// serve pure static assets
const staticPath = path.posix.join(config.dev.assetsPublicPath, config.dev.assetsSubDirectory)
app.use(staticPath, express.static('./static'))

const uri = 'http://localhost:' + port

var _resolve
var _reject
var readyPromise = new Promise((resolve, reject) => {
  _resolve = resolve
  _reject = reject
})

var server
var portfinder = require('portfinder')
portfinder.basePort = port

console.log('> Starting dev server...')
devMiddleware.waitUntilValid(() => {
  portfinder.getPort((err, port) => {
    if (err) {
      _reject(err)
    }
    process.env.PORT = port
    var uri = 'http://localhost:' + port
    console.log('> Listening at ' + uri + '\n')
    // when env is testing, don't need open it
    if (autoOpenBrowser && process.env.NODE_ENV !== 'testing') {
      opn(uri)
    }
    server = app.listen(port)
    _resolve()
  })
})

module.exports = {
  ready: readyPromise,
  close: () => {
    server.close()
  }
}

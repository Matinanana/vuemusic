/*
 * 推荐相关的方法
 */
import jsonp from 'common/js/jsonp'
import {commonParams,options} from './config'
import axios from 'axios'

//获取轮播图数据
export function getRecommend(){
	//QQ音乐 recommend请求路径
	let url = 'https://c.y.qq.com/musichall/fcgi-bin/fcg_yqqhomepagerecommend.fcg'
	//把参数 以及 需要额外添加的参数 共同赋值到 另外一个空对象中
	let data = Object.assign({},commonParams,{
		 platform:'h5',
    	 needNewCode:1
	})
	//jsonp请求 发送
	return jsonp(url,data,options)
}

//获取歌单数据   
export function getDiscList(){
	//歌单请求路径
	let url='/api/getDiscList'
	let data=Object.assign({},commonParams,{
		rnd:Math.random(),
		hostUin:0,
		platform:'yqq',
		needNewCode:0,
		categoryId:10000000,
		sortId:5,
		sin:0,
		ein:29,
		format:'json'//因为用的是ajax请求 所以返回的是json数据，不是jsonp数据
	})
	//ajax请求
	return axios.get(url,{
		params:data
	}).then((res)=>{
		return Promise.resolve(res.data)
	})
}

//获取歌单详情数据
export function getSongList(disstid){
	const url='/api/getSongList'
	const data=Object.assign({},commonParams,{
		type:1,
		json:1,
		utf8:1,
		onlysong:0,
		disstid,
		g_tk:5381,
		hostUin:0,
		platform:'yqq',
		needNewCode:0,
		format:'json'
	})
	return axios.get(url,{
		params:data
	}).then((res)=>{
		return Promise.resolve(res.data)
	})
}

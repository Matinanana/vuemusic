/*
   * 歌手相关的方法
   */
import jsonp from 'common/js/jsonp'
import {commonParams,options} from './config'

//获取歌手列表数据
export function getSingerList(){
	const url='https://c.y.qq.com/v8/fcg-bin/v8.fcg'
	const data=Object.assign({},commonParams,{
		channel:'singer',
		page:'list',
		key:'all_all_all',
		pagesize:100,
		pagenum:1,
		hostUin:0,
		platform:'yqq',
		needNewCode:0,
		g_tk:5381
	})
	return jsonp(url,data,options)
}

//获取歌手详情信息数据
export function getSingerDetail(singerId){
	const url='https://c.y.qq.com/v8/fcg-bin/fcg_v8_singer_track_cp.fcg'
	const data=Object.assign({},commonParams,{
		g_tk:1523655189,
		hostUin:0,
		platform:'yqq',
		needNewCode:0,
		singermid:singerId,
		order:'listen',
		begin:0,
		num:30,
		songstatus:1
	})
	return jsonp(url,data,options)
}


import jsonp from 'common/js/jsonp'
import {commonParams,options} from './config'

export function getHotKey(){//请求热门搜索数据
	const url='https://c.y.qq.com/splcloud/fcgi-bin/gethotkey.fcg'
	const data=Object.assign({},commonParams,{
		g_tk:5381,
		platform:'h5',
		needNewCode:1
	})
	return jsonp(url,data,options)
}

export function search(query,page,zhida,perpage){//请求检索词相关数据信息
	const url='https://c.y.qq.com/soso/fcgi-bin/search_for_qq_cp'
	const data=Object.assign({},commonParams,{
		g_tk:5381,
		platform:'h5',
		needNewCode:1,
		w:query,
		zhidaqu:1,
		catZhida:zhida?1:0,
		t:0,
		flag:1,
		ie:'utf-8',
		sem:1,
		aggr:0,
		perpage,
		n:perpage,
		p:page,
		remoteplace:'txt.mqq.all'
	})
	return jsonp(url,data,options)
}

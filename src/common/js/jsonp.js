//请求jsonp路径封装与请求
import originJSONP from 'jsonp'
//jsonp的请求
export default function jsonp(url,data,option){
	/*
	 * 知识点一：
	 * jQuery.param()函数用于将一个JS数组或纯粹的对象序列化为字符串值，
	 * 以便用于URL查询字符串或AJAX请求。
	 * var v11 = $.param( { name:"CodePlayer", age:18 } ); 
	 * 结果：//"name=CodePlayer&age=18"
	 * 
	 * 知识点二：
	 * indexOf() 方法可返回某个指定的字符串值在字符串中首次出现的位置。
	 */
	url+=`${url.indexOf('?')<0?'?':'&'}${param(data)}`;
	return new Promise((resolve,reject)=>{
		originJSONP(url,option,(err,data)=>{
			if(!err){
				resolve(data)
			}
			else{
				reject(err)
			}
		})
	})
}

//拼接url尾部参数的方法
export function param(data){
	let url='';
	for (let k in data) {
		let value=data[k]!==undefined?data[k]:'';
		url+=`&${k}=${encodeURIComponent(data[k])}`;
		/*
		 * encodeURIComponent，它是将中文、韩文等特殊字符转换成utf-8格式的url编码，
		 * 所以如果给后台传递 参数需要使用encodeURIComponent时需要后台解码对utf-8支持
		 * （form中的编码方式和当前页面编码方式相同）
		 */
	}
	return url?url.substring(1):'';
	/*
	 * substring()的用法：
	 *
	 * var str="Helloworld!"
	 * document.write(str.substring(1,3));
	 * 上面返回字符串:"el";
	 * str.substring(1,2) //返回e
	 * str.substring(1) //返回"elloworld";
	 */
}

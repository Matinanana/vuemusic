/*
 * dom相关操作的代码
 */

//在某个标签添加一个class
export function addClass(el,className){//参数一：dom对象，参数二：类名
	if(hasClass(el,className)){//存在className
		return
	}
	let newClass=el.className.split(' ')//用空格分隔成字符串数组
	newClass.push(className)
	el.className=newClass.join(' ')//用空格隔开返回一个字符串
}
//判断某个标签里是否存在某个className
export function hasClass(el,className){
	//RegExp 对象表示正则表达式     ^开头标志  |或者  $结尾标志   \\s表示空白字符
	let reg=new RegExp('(^|\\s)'+className+'(\\s|$)')
	//test()方法用于判断reg是否与el.className相等，相等为true,不等为false
	return reg.test(el.className)
}
//获取或设置自定义属性(data-)的值
export function getData(el,name,val){
	const prefix="data-"
	name=prefix+name
	if(val){//设置自定义属性(data-)的值
		return el.setAttribute(prefix+name,val)
	}
	else{//获取自定义属性(data-)的值
		return el.getAttribute(name)
	}
}

//能力检测
let elementStyle=document.createElement('div').style

let vendor=(()=>{//供应商 执行一个立即执行函数
	let transformNames={
		webkit:'webkitTransform',
		Moz:'MozTransform',
		O:'OTransform',
		ms:'msTransform',
		standard:'transform',
	}
	
	//遍历transformNames
	for (let key in transformNames) {
		if(elementStyle[transformNames[key]]!==undefined){
			return key
		}
	}
	return false //当所有的供应商不支持时 返回false
})()

export function prefixStyle(style){
	if(vendor===false){
		return false
	}
	if(vendor==='standard'){
		return style
	}
	return vendor+style.charAt(0).toUpperCase()+style.substr(1)
}

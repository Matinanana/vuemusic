// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router' //引入router文件夹
import store from './store' //引入store文件夹

//在webpack.base.conf.js中 可以更改 引入路径前缀
//如果webpack配置 做更改了 那么就需要重启
import 'common/stylus/index.styl'

import 'babel-polyfill'//支持更高版本的es6　api
import fastclick from 'fastclick'//减少手机端点击300MS问题,减少延迟,减少重复点击
import VueLazyLoad from 'vue-lazyload'//懒加载插件

//整个Body中 只要含有指尖点击 那么 就减少延迟
fastclick.attach(document.body)

//使用懒加载
Vue.use(VueLazyLoad,{
	loading:require('common/image/default.png')
})

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
	router,
	store,
  template: '<App/>',
  components: { App }
})

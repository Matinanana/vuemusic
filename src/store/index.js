//入口
import Vue from 'vue'
import Vuex from 'vuex'
import * as actions from './actions' 
import * as getters from './getters' //*的使用就不用{}，可以用.表示，比如getters.singger
import state from './state'
import mutations from './mutations'
import createLogger from 'vuex/dist/logger' //通过mutations去修改state时，会在控制台打个log，可以看到修改记录

Vue.use(Vuex)//注册vuex

//vuex调试工具,线下调试debug为true
const debug=process.env.NODE_ENV!=='production'

export default new Vuex.Store({ //Store实例
	actions,
	getters,
	state,
	mutations,
	strict:debug, //严格模式
	plugins:debug ? [createLogger()]:[]
})

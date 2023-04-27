
import {USER_LOGIN,INIT_USER,LOGIN_OUT} from './mutations-type.js'
export default{
	state:{
		// 登陆状态，默认return false
		loginStatus:false,
		// token
		token:null,
		// 用户信息（头像昵称）
		userInfo:{}
	},
	getters:{
		
	},
	mutations:{
		// 设置
		[USER_LOGIN](state,user){
			// console.log(123)
			state.loginStatus=true;
			state.token=user.token;
			state.userInfo=user;
			// console.log(state,user)
			// 本地存储
			localStorage.setItem('teaUserInfo',JSON.stringify(user));
		},
		// 读取数据
		[INIT_USER]( state ){
			let userInfo = JSON.parse( localStorage.getItem('teaUserInfo') );
			if( userInfo ){
				state.loginStatus = true;
				state.token = userInfo.token;
				state.userInfo = userInfo;
			}
		},
		// 退出登录
		[LOGIN_OUT](state){
			state.loginStatus = false;
			state.token = null;
			state.userInfo = {};
			localStorage.removeItem('teaUserInfo')
		}
	},
	actions:{
		
	}
}
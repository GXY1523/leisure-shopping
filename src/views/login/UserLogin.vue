<template>
	<div class="userLogin container">

		<Header></Header>
		<section>
			<div class='login-tel'>
				<input type="text" v-model='userTel' placeholder="请输入手机号" pattern="[0-9]*">
			</div>
			<div class='login-tel'>
				<input type="text" v-model='userPwd' placeholder="请输入密码" >
			</div>
			<div class='login-btn' @click='login'>登 录</div>
			<div class='tab'>
				<span @click='goLogin'>短信验证码登录</span>
				<span @click="goRecovery">找回密码</span>
				<span @click="goRegister">快速注册</span>
			</div>
		</section>
		<Tabbar></Tabbar>
	</div>
</template>

<script>
	import Tabbar from "@/components/common/Tabbar.vue"
	import Header from "@/components/login/Header.vue"
import axios from "axios";
	import { Toast } from 'mint-ui';
	import http from '@/common/api/request.js'
	import {mapMutations} from 'vuex'
// import { USER_LOGIN } from "@/store/modules/mutations-type";
	export default{
		name:"userLogin",
		data(){
			
			return{
				userTel:'',	// 输入的账号密码
				userPwd:'',
				// 验证规则
				rules:{
					userTel:{
						rule:/^1[23456789]\d{9}$/,
						msg:'手机号不能为空，并且是11位数字',
					},
					//密码验证
					userPwd:{
						rule:/^\w{6,12}$/,
						msg:'密码不能为空，并且要求6-12位',
					}
				}
			}
		},
		components:{
		  Tabbar,
		  Header,
		},
		methods:{
			...mapMutations(['USER_LOGIN']),
			// 跳转注册页
			goRegister(){
				this.$router.push('/rejister')
			},
			// 验证码登录页
			goLogin(){
				this.$router.push('/login');
			},
			// 登录
			login(){
				//判断输入内容是否符合要求
				if(!this.validate('userTel')) return;
				if(!this.validate('userPwd')) return;
				// 发送请求，后端验证
				http.$axios({
					url:'/api/login',
					method:'POST',
					data:{
						userTel:this.userTel,
						userPwd:this.userPwd,
					}
				}).then(res=>{
					// console.log(res)
					// 提示信息
					Toast(res.msg);
					// 登陆失败
					if(!res.success) return;
					
					// 登陆成功
					// 跳转至我的页面
					// 将登陆信息存到vuex里
					this.USER_LOGIN(res.data)
					this.$router.push('/my')
					
				})
				
			},
			// 验证信息提示(判断输入内容是否符合要求)
			validate(key){
				let bool=true;
				if(!this.rules[key].rule.test(this[key])){
					// 提示信息
					Toast(this.rules[key].msg);
					bool=false;
					return false;
				}
				return bool;
			},
			
			// 找回密码
			goRecovery(){
				this.$router.push('/recovery')
			}
		}
	}
</script>

<style scoped lang="scss">
	section{
		display: flex;
		flex-direction: column;
		align-items: center;
		background-color: #f4f4f4;
		font-size: 14px;
		div{
			width: 335px;
			height: 50px;
			margin: 10px 0;
		}
		input{
			box-sizing: border-box;
			padding: 0 10px;
			line-height:50px;
			border: 1px solid #ccc;
			border-radius: 6px;
		}
		.login-tel{
			margin-top:30px;
			input{
				width: 335px;
			}
		}
		
		.login-btn{
			background-color:beige;
			line-height: 50px;
			border-radius: 6px;
			text-align: center;
			font-size:20px;
		}
		.tab{
			display: flex;
			justify-content: space-between;
			font-size:15px;
		}
	}
</style>
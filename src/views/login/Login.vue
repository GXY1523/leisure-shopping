<template>
	<div class="login container">
		<Header></Header>
		<section>
			<div class='login-tel'>
				<input type="text" v-model='userTel' placeholder="请输入手机号" pattern="[0-9]*">
			</div>
			<div class='login-code'>
				<input type="text" v-model='userCode' placeholder="请输入短信验证码" pattern="[0-9]*">
				<button
				@click='sendCode'
				:disabled="disabled"
				>{{codeMsg}}</button>
			</div>
			<div class='login-btn' @click="login">登 录</div>
			<div class='tab'>
				<span @click='goUserLogin'>密码登录</span>
				<span @click="goRegister">快速注册</span>
			</div>
		</section>
		<Tabbar></Tabbar>
	</div>
</template>

<script>
	import Tabbar from "@/components/common/Tabbar.vue"
	import Header from "@/components/login/Header.vue"
	import { Toast } from 'mint-ui';
	import http from '@/common/api/request.js'
	import {mapMutations} from 'vuex'
	export default{
		name:'Login',
		data(){
			return{
				userTel:'',
				userCode:'',
				disabled:false,
				// 验证规则
				rules:{
					userTel:{
						rule:/^1[23456789]\d{9}$/,
						msg:'手机号不能为空，并且是11位数字',
					},
					
				},
				codeNum:60,
				codeMsg:'获取短信验证码',
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
			// 密码登录页
			goUserLogin(){
				this.$router.push('/userLogin');
			},
			// 获取短信验证码
			sendCode(){
				// 先判断手机号格式
				if(!this.validate('userTel')) return;
				// 请求 短信验证码接口
				http.$axios({
					url:'/api/code',
					method:'POST',
					data:{
						phone:this.userTel
					}
				}).then(res=>{
					if(res.success){
						this.code=res.data;
					}
				})
				
				// 禁用状态
				this.disabled=true;
				// 倒计时
				let timer=setInterval(()=>{
					--this.codeNum;
					this.codeMsg=`重新发送${this.codeNum}`;
				},1000)
				setTimeout(()=>{
					clearInterval(timer);
					this.codeNum=60;
					this.disabled=false;
					this.codeMsg='获取短信验证码'
				},60000)
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
			
			// 登录
			login(){
				
				if(this.code==this.userCode){	// 验证码输入正确
					// 发送请求
					http.$axios({
						url:'/api/addUser',
						method:'POST',
						data:{
							phone:this.userTel
						}
					}).then(res=>{
						if(!res.success) return;
						// console.log(res);
						//登录成功 ==》跳转页面，存储用户信息
						this.USER_LOGIN( res.data );
						//跳转到我的页面中
						this.$router.push('/my');
					})
				}
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
		.login-code{
			display: flex;
			margin-top:30px;
	
			input{
				flex:1;

			}
			button{
				padding: 0 10px;
				line-height: 50px;
				border: 0;
				margin-left: 10px;
				border-radius: 6px;
				background-color:beige;
				
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
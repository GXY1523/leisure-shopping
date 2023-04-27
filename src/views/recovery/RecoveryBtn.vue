<template>
	<div class="login container">
		<Header><span>找回密码</span></Header>
		<section>
			<div class='login-tel'>
				<input type="text" v-model='userPwd' placeholder="请输入6-12位的新密码" >
			</div>
			
			<div class='login-btn' @click="submitBtn">确认</div>
			
		</section>
		<Tabbar></Tabbar>
	</div>
</template>

<script>
	import Tabbar from "@/components/common/Tabbar.vue"
	import Header from "@/components/login/Header.vue"
	import { Toast } from 'mint-ui';
	import http from '@/common/api/request.js'
	export default{
		name:'RecoveryBtn',
		data(){
			return{
				userPwd:'',
				//验证规则
				rules:{//密码格式验证
					userPwd:{
						rule:/^\w{6,12}$/,
						msg:'密码不能为空，并且是6-12位'
					}
				},
			}
		},
		components:{
		  Tabbar,
		  Header,
		},
		methods:{
			
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
			
			// 修改密码
			submitBtn(){
				// 判断密码格式是否正确
				if(!this.validate('userPwd')) return;
				// 发送请求
				http.$axios({
					url:'/api/recovery',
					method:'POST',
					data:{
						phone:this.$route.query.phone,
						pwd:this.userPwd
					}
				}).then(res=>{
					Toast('修改成功');
					if(res.success) {
						// 登陆成功 跳转至密码登录页面
						this.$router.push({
							path:'/userLogin'
						})
					};
					
				})
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
			// font-size:17px;
		}
		
	}
</style>
<template>
	<div class="my container">
		<header>
			<div class='user-info' v-if='loginStatus'>
				<img :src="userInfo.imgUrl" alt="">
				<span>{{userInfo.nickName}}</span>
			</div>
			<div v-else class='login' @click='goLogin'>登录/注册</div>
		</header>
		<section>
			<ul>
				<li @click='goPath'>地址管理</li>
				<li v-if='loginStatus' @click="loginOut">退出登录</li>
			</ul>
		</section>
		<Tabbar></Tabbar>
	</div>
</template>

<script>
	import Tabbar from "@/components/common/Tabbar.vue"
	import {mapState,mapMutations} from 'vuex'
	export default {
	  name: "My",
	  components:{
	  	  Tabbar,
	  	},
		computed:{
				...mapState({
						loginStatus:state=>state.user.loginStatus,
						userInfo:state=>state.user.userInfo
					})
		},
		methods:{
			// 退出登录
			...mapMutations(['loginOut']),
			goLogin(){
				this.$router.push('/login')
			},
			// 地址管理
			goPath(){
				this.$router.push('/path')
			}
			
		}
	};
</script>

<style scoped lang="scss">
	header{
		display: flex;
		justify-content: center;
		align-items: center;
		width: 100%;
		height: 156px;
		background-color: beige;
		.login{
			padding:7px 13px;
			font-size:17px;
			color:#fff;
			background-color:#f6b42f;
			border-radius: 6px;
		}
		.user-info{
			
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: center;
			img{
				width: 94px;
				height: 94px;
				border-radius: 50%;
			}
			span{
				padding:7px 13px;
				font-size:17px;
				color:#e9a339;
				// color:#fff;
			}
		}
	}
	section{

		ul li{
			padding:13px;
			font-size:17px;
		}
	}
	
</style>
<template>
	<header>
		<div class="search-return" @click='goBack'>
			<i class="iconfont icon-fanhui"></i>
		</div>
		<div class="search-main">
			<slot>
				<span>登录</span>
			</slot>
			
		</div>
		<div class='go-home' @click="gohome">
			<i class="iconfont icon-zhuye"></i>
		</div>
	</header>
</template>

<script>
	export default{
		name:'Header',
		methods:{
			goBack(){
				if ( this.$route.name == 'pathList' ){
				    this.$router.replace('/path');
				}else if ( this.$route.name == 'path' ){
				    this.$router.replace('/my');
				}else{
					this.$router.back();
				}
				
				
			},
			gohome(){
				this.$router.push('/home');
			},
		}
	}
</script>

<style scoped lang="scss">
	header{
		width: 100%;
		height: 52px;
		display: flex;
		justify-content: space-between;
		align-items: center;
		background-color:beige;
		color: #000000;
		.search-return,.go-home{
			padding: 0 10px;
			i{
				font-size: 25px;
			}
		}
		.search-main{
			display: flex;
			align-items: center;
			span{
				
				font-size: 17px;
			}
		}
		
	}
</style>
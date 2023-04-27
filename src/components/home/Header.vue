<template>
	<header>
		<h1>
			<img src="@/assets/images/zhuye-copy.png" alt="">
		</h1>
		<div class="search" @click="goSearch">
			<i class="iconfont icon-sousuo_o"></i>
			<span>等你发现</span>
		</div>
		<div class="kefu">
			<i class="iconfont icon-kefu"></i>
		</div>
	</header>
</template>

<script>
	export default{
		methods:{
			goSearch(){
				this.$router.push('/search')
			}
		}
	}
</script>

<style scoped>
	header{
		width: 100%;
		height: 52px;
		background-color: beige;
		align-items: center;
		
		
		display: flex;
		justify-content: space-around;
	}
	header h1{
		width: 85px;
		height: 52px;
	}
	header h1 img{
		width: 100%;
		height: 100%;
	}
	.search{
		/* width: 246px; */
		width: 230px;
		height: 33px;
		background-color: #fff;
		border-radius: 5px;
		display: flex;
		align-items: center;
	}
	.search i{
		padding: 0 16px;
		color: #ccc;
	}
	.search span{
		color: #ccc;
		font-size: 14px;
	}
	.kefu i{
		font-size: 36px;
		color: #fff;
	}
</style>
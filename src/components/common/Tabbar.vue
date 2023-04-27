<template>
	<div class="tabber">
		<ul>
			<li v-for="(item,index) in routerList" :key="index"
			@click="switchTab(item.path)">
			<!-- $route.path.includes(item.path) 判断当前路径 与 点击图标的路径 是否一致 -->
				<img :src="$route.path.includes(item.path) ? item.selected : item.active" alt="">
				<span :class="$route.path.includes(item.path) ? 'selected' : ''">{{item.title}}</span>
			</li>
			
		</ul>
	</div>
	
</template>

<script>
	export default{
		data(){
			return {
				routerList:[
					{
						title:'首页',
						path:'/home',
						active:'/images/zhuye.png',
						selected:'/images/zhuye-copy.png'	//点击，图标颜色变化
					},
					{
						title:'分类',
						path:'/list',
						active:'/images/fenlei.png',
						selected:'/images/fenlei-copy.png'	//点击，图标颜色变化
					},
					{
						title:'购物车',
						path:'/cart',
						active:'/images/gouwuche.png',
						selected:'/images/gouwuche-copy.png'	//点击，图标颜色变化
					},
					{
						title:'我的',
						path:'/my',
						active:'/images/wode.png',
						selected:'/images/wode-copy.png'	//点击，图标颜色变化
					},
				]
			}
		},
		methods:{
			// 路由跳转
			switchTab(path){
				// 判断点击的是否是同一个 路由
				// 如果是，不变
				if(this.$route.path==path) return;
				// 不是，跳转至对应页面
				this.$router.replace(path)
			}
		}
	}
</script>

<style scoped>
	.tabber{
		position: fixed;
		left: 0;
		bottom: 0;
		z-index: 999;
		width: 100%;
		height: 56px;
		background-color: #fff;
	}
	.tabber ul{
		display: flex;
		justify-content: space-around;
		width: 100%;
		height: 100%;
		align-items: center;
	 }
	.tabber ul li{
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	.tabber ul li img{
		width: 31px;
		height: 31px;
	}
	.tabber ul li span{
		font-size: 15px;
	}
	.selected{
		color: #f4ea2a;
	}
</style>
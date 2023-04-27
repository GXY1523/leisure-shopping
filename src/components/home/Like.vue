<template>
	<div class="like">
		<Card><span>猜你喜欢</span></Card>
		<ul>
			<li v-for="(item,index) in likeList" :key="index"
				@click="goDetail(item.id)"
				>
				<h2>
					<!-- 使用懒加载 -->
					<img v-lazy="item.imgUrl" alt="">
				</h2>
				<h3>{{item.name}}</h3>
				<div>
					<span>￥</span>
					<b>{{item.price}}</b>
				</div>
			</li>
		</ul>
		
	</div>
</template>

<script>
	// 图片 懒加载
	import { Lazyload } from 'mint-ui';
	import Card from "@/components/home/Card.vue"
	export default{
		name:'Like',
		props:{
			likeList:Array,
		},
		components:{
				Card,
			},
			methods:{
				goDetail(id){
					this.$router.push({
						// 路由传值 显式
						path:'/detail',
						query:{
							id
						},
						// 隐式
						// name:"Detail",
						// params:{
						// 	id
						// }
					})
				}
			}
	}
</script>

<style scoped>
	.like ul{
		display: flex;
		flex-wrap: wrap;
	}
	.like ul li{
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		width: 46%;
		padding:2px 5px;
	}
	.like img{
		width: 140px;
		height: 140px;
	}
	
	h3{
		padding: 5px;
		width: 93%;
		font-size: 14px;
		color: #444444;
		font-weight: 500;
		text-align: center;
		
		/* 文字一行放不下，以省略号代替 */
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	
	.like ul li > div{
		width: 93%;
		text-align: left;
		padding:0 5px;
	}
	.like ul li > div span{
		font-size: 14px;
	}
	.like ul li > div b{
		font-size: 17px;
		color: #97292f;
	}
	/* 图片未完全显示前的颜色 */
	.like img[lazy=loading]{
		background-color: #ebfffb;
	}
</style>
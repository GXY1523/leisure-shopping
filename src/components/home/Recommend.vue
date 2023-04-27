<template>
	<div class="recommend">
		<Card></Card>
		<ul>
			<li v-for="(item,index) in recommendList" :key="index">
				<h2>
					<img :src="item.imgUrl" alt="">
				</h2>
				<div>
					<h3>{{item.name}}</h3>
					<p>{{item.content}}</p>
					<div class="price">
						<span>￥</span>
						<b>{{item.price}}</b>
					</div>
				</div>
			</li>
		</ul>
	</div>
</template>

<script>
	import Card from "@/components/home/Card.vue"
	export default{
		name:'Recommend',
		props:{
			recommendList:Array,
		},
		components:{
				Card,
			}
	}
</script>

<style scoped>
	.recommend ul li{
		position: relative;
	}
	.recommend ul li img{
		width: 360px;
		height: 144px;
		border-radius: 12px;
	}
	.recommend ul li > div{
		position: absolute;
		right: 0;
		top: 0;
		display: flex;
		flex-direction: column;
		padding: 30px;
	}
	.recommend ul li > div h3{
		font-size: 15px;
	}
	.recommend ul li > div p{
		font-size: 13px;
	}
	.price{
		margin-top: 20px;
		font-size: 14px;
		text-align: right;
		color:red;
	}
</style>
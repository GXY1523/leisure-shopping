<template>
	<div class="search-list">
		<div class="header">
			<Header></Header>
			<ul>
				<li v-for="(item,index) in searchList.data" 
				:key="index" 
				@click="changeTab(index)">
					<!-- :class="searchList.currentIndex==index?'active':''" 刚进入页面，使综合 变高亮 -->
					<div :class="searchList.currentIndex==index?'active':''">{{item.name}}</div>
					<div class="search-filter" v-if="index!=0">
						<i class="iconfont icon-xiangshang"
							:class=' item.status == 1 ? "active" : ""'
						></i>
						<i class="iconfont icon-xiangxia"
							:class=' item.status == 2 ? "active" : ""'
						></i>
					</div>
				</li>
				<!-- <li>
					<div>综合</div>
				</li>
				<li>
					<div>价格</div>
					<div class="search-filter">
						<i class="iconfont icon-xiangshang"></i>
						<i class="iconfont icon-xiangxia"></i>
					</div>
				</li>
				<li>
					<div>销量</div>
					<div class="search-filter">
						<i class="iconfont icon-xiangshang"></i>
						<i class="iconfont icon-xiangxia"></i>
					</div>
				</li> -->
			</ul>
		</div>
		
		<section>
			<ul v-if="goodsList.length">
				<li 
					v-for='(item,index) in goodsList'
					:key='index'
				>
					<img v-lazy="item.imgUrl" alt="">
					<h3>{{item.name}}</h3>
					<div class='price'>
						<div>
							<span>¥</span>
							<b>{{item.price}}</b>
						</div>
						<div>立即购买</div>
					</div>
				</li>
				<!-- <li>
					<img src="../../assets/images/ad2.png" alt="">
					<h3>赛事茶-第三届武夷山茶叶交易会暨仙店杯-优质奖肉桂160g</h3>
					<div class='price'>
						<div>
							<span>¥</span>
							<b>238</b>
						</div>
						<div>立即购买</div>
					</div>
				</li>
				<li>
					<img src="../../assets/images/zhuye-copy.png" alt="">
					<h3>赛事茶-第三届武夷山茶叶交易会暨仙店杯-优质奖肉桂160g</h3>
					<div class='price'>
						<div>
							<span>¥</span>
							<b>238</b>
						</div>
						<div>立即购买</div>
					</div>
				</li> -->
				
			</ul>
			<!-- 搜索结果不存在时 -->
			<h1 v-else>糟了！没有找到</h1>
		</section>
		<Tabbar></Tabbar>
	</div>
</template>

<script>
	import Header from '@/components/search/Header.vue'
	import Tabbar from '@/components/common/Tabbar.vue'
	import http from '@/common/api/request.js'
	import { Lazyload } from 'mint-ui';
	export default{
		data(){
			return{
				goodsList:[],
				// 价格列表
				searchList:{
					currentIndex:0,
					data:[
						/*
						status:0 都不亮
						status:1 上箭头亮
						status:2 下箭头亮
						*/
						{name:'综合',key:'zh'},
						{name:'价格',status:0,key:'price'},
						{name:'销量',status:0,key:'num'},
						
					]
				}
			}
		},
		computed:{
			orderBy(){
				// 知道当前是哪一个对象
				let obj = this.searchList.data[this.searchList.currentIndex];
				// 针对状态，判断升序(asc)、降序(desc) 
				let val = obj.status == '1' ? 'asc' : 'desc';
				return {
					[obj.key]:val
				}
			}
		},
		components:{
			Tabbar,
			Header,
		},
		created(){
				this.getData();
		},
		methods:{
			// 请求后台数据
			getData(){
				http.$axios({
					url:'/api/goods/shopList',
					params:{
						searchName:this.$route.query.key,
						...this.orderBy
						
					}
				}).then(res=>{
					this.goodsList=res
				});
			},
			// 高亮切换
			changeTab(index){
				// 点击，使对应地方高亮显示
				this.searchList.currentIndex = index;
				// 获取点击 对应的下标
				let item = this.searchList.data[index];
				// console.log(item)
				// 取消除点击之外的所有的状态值（让其他都变黑色）
				this.searchList.data.forEach((v,i)=>{
					if( i != index ){
						v.status = 0;
					}
				})
				// 当前点击的状态改变
				if(  index == this.searchList.currentIndex ){
					item.status = item.status == 1 ? 2 : 1;
				}
				//发送请求进行数据排序
				this.getData();
			},
			
		},
		watch:{
			// 使其在搜索界面能继续搜索
			$route(){
				this.getData();
			}
		}
	}
</script>

<style scoped>
	.search-list{
		width: 100vw;
		height: 100vh;
		overflow: hidden;
		display: flex;
		flex-direction: column;
	}
	.header ul{
		display: flex;
		justify-content: space-around;
		padding: 10px 0;
		font-size: 17px;
	}
	.header ul li{
		display: flex;
		align-items: center;
	}
	.header ul li > div{
		padding: 0 3px;
	}
	.header ul li .search-filter{
		display: flex;
		flex-direction: column;
	}
	.header ul li .search-filter i{
		font-size: 10px;
	}
	
	section{
		flex: 1;
		overflow: hidden;
	}
	section ul{
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
	}
	section ul li {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		box-sizing: border-box;
		width: 50%;
		padding:10px;
	}
	section ul li img{
		width: 155px;
		height: 155px;
	}
	section ul li h3{
		width: 100%;
		font-size:14px;
		color:#444444;
		font-weight: 400;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		padding: 5px;
	}
	section ul li .price{ 
		display: flex;
		justify-content: space-between;
		padding:5px 0;
		width: 100%;
		font-size:14px;
	}
	section ul li .price div:first-child span{
		font-size: 14px;
		color:#97292f;
	}
	section ul li .price div:first-child b{
		color:#97292f;
		font-size:17px;
	}
	section ul li .price div:last-child{
		padding:3px 6px;
		color:#fff;
		background-color: #97292f;
		border-radius: 6px;
	}
	section ul li img[lazy=loading]{
		background-color: #ebfffb;
	}
	.active{
		color:#e45e29;
	}
</style>
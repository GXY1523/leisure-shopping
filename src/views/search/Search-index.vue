<template>
	<div class="search-index">
		<Header></Header>
		<section>
			<!-- v-if='searchArr.length' 如果有搜索记录就显示 -->
			<div class="search-history" v-if='searchArr.length'>
				<h2>
					<i class="iconfont icon-shouye"></i>
					<span>搜索记录</span>
					<span @click="deleteStorage">清空历史记录</span>
				</h2>
				<ul>
					<li v-for="(item,index) in searchArr" :key="index"
						@click="goSearchList(item)">
						{{item}}
					</li>
					
				</ul>
			</div>
			<div class="search-history" v-else><h2>暂无搜索记录</h2></div>
		</section>
		<Tabbar></Tabbar>
	</div>
	
</template>

<script>
	import Tabbar from '@/components/common/Tabbar.vue'
	import Header from '@/components/search/Header.vue'
	import { MessageBox } from 'mint-ui';
	export default{
		data(){
				return{
					searchArr:[]
				}
		},
		components:{
			Tabbar,
			Header,
		},
		created(){
			this.searchArr=JSON.parse(localStorage.getItem('searchList')) || []
		},
		methods:{
			// 清空历史记录
			deleteStorage(){
				// 使用弹窗组件
				MessageBox({
				  title: '提示',
				  message: '确认删除全部历史记录？',
				  showCancelButton: true
				}).then(res=>{
					// 如果按下确认
					if(res=='confirm'){
						// 删除本地存储
						localStorage.removeItem('searchList')
						// 清除数据
						this.searchArr=[]
					}
				});
			},
			//点击历史记录，进入相应搜索界面
			goSearchList(item){
				// console.log(item)
				// 页面跳转
				this.$router.push({
					name:'list',
					// 将搜索内容也传过去
					query:{
						key:item
					}
				})
			}
		}
	}
</script>

<style scoped>
	.search-index{
		width: 100vw;
		height: 100vh;
		overflow: hidden;
		display: flex;
		flex-direction: column;
	}
	section{
		flex: 1;
		overflow: hidden;
		background-color: #f4f4f4;
	}
	
	/* 搜索 */
	.search-history h2{
		position: relative;
		padding: 10px;
		font-size: 17px;
		font-weight: 400;
	}
	.search-history h2 i{
		padding-right: 6px;
	}
	.search-history h2 span:last-child{
		position: absolute;
		right: 6px;
	}
	.search-history ul{
		display: flex;
		flex-wrap: wrap;
		/* padding:0 10px; */
	}
	.search-history ul li{
		margin: 10px;
		padding: 3px 6px;
		font-size: 15px;
		border: 1px solid #ccc;
	}
</style>
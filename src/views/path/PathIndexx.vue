<template>
	<div class="pathIndexx container">
		<Header><span>我的收货地址</span></Header>
		<section>
			<ul  v-if='list.length'>
				<li 
					
					v-for="(item,index) in list" :key="index"
					@click='goList(item)'>
					<div>
						<span>{{item.name}}</span>
						<span>{{item.tel}}</span>
					</div>
					<div>
						<span class='active' v-if='item.isDefault == 1'>[默认]</span>
						 <span>{{item.province}}</span>
						<span>{{item.city}}</span>
						<span>{{item.county}}</span>
						<span>{{item.addressDetail}}</span>
					</div>
				</li>
			</ul>
			<h1 v-else>暂无数据，请添加地址</h1>
			<div class='add-path' @click='goList("add")'>添加地址</div>
		</section>
		<Tabbar></Tabbar>
	</div>
</template>

<script>
	import Header from '@/components/login/Header.vue'
	import Tabbar from "@/components/common/Tabbar.vue"
	import http from '@/common/api/request.js'
	import {mapState,mapMutations} from 'vuex'
	import bus from '@/common/bus'
	export default{
		name:'PathIndexx',
		data() {
			return{
				pathStatus:false
			}
		},
		components:{
		  Tabbar,
		  Header,
		},
		created(){
			//从订单页面进来的
			if(this.$route.query.type=='select'){
				this.pathStatus=true;
			}
				this.getData();
		},
		computed:{
			...mapState({
				list:state=>state.path.list
			})
		},
		methods:{
			...mapMutations(['initData']),
			goList(option){
				//this.pathStatus为true代表从订单页面进入的：选择状态
				if(this.pathStatus){
					
					bus.$emit('selectPath',JSON.stringify(option));
					this.$router.back();
					return;
				}
				this.$router.push({
					name:'PathList',
					// 将整个地址信息传递过去
					params:{
						key:JSON.stringify(option)
					}

				})
			},
			getData(){
				http.$axios({
								  
					url:'/api/selectAddAddress',
					method:'post',
					headers:{
						token:true
					},
					
				}).then(res=>{
					this.initData( res.data );
					// console.log('res')
					  // console.log(res.data)
					 
					  // if( !res.success ) return;
					  // // console.log(res)
					  // Toast(res.msg);
					  // this.$router.push({
						 //  name: "Paths",
					  // });
				})
			},
			
		}
	}
</script>

<style scoped lang="scss" >
	section{
		background-color: #f4f4f4;
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	ul{
		width: 100%;
		li{
			padding:16px 10px;
			margin:10px 0;
			background-color: #fff;
			span{
				padding-right:10px;
				font-size:17px;
			}
			.active{
				color:#97292f;
			}
		}
	}
	.add-path{
		margin-top:10px;
		width: 130px;
		line-height:50px;
		font-size:17px;
		text-align:center;
		border-radius: 6px;
		background-color:#f6b42f;
		color: #fff;
	}

		
</style>
<template>
	<div class="list">
		<header v-show='isShow'>
			<div class="search-return" @click='goBack'>
				<i class="iconfont icon-fanhui"></i>
			</div>
			<div class="search-main">
				<i class="iconfont icon-sousuo_o"></i>
				<span>快看!</span>
			</div>
			<div class='go-home' @click="gohome">
				<img src="@/assets/images/zhuye-copy.png" alt="">
			</div>
		</header>
		<section>
			<div class="list-l" ref='left'>
				<ul class="l-item">
					<li :class='{active:index==currentIndex}'
						v-for='(item,index) in leftData' :key="index"
						@click="goScroll(index)"
						>
						{{item.name}}
					</li>
					
				</ul>
			</div>
			<div class="list-r" ref='right'>
				<div>
					<ul
						v-for="(item,index) in rightData" :key="index"
						class="shop-list"
					>
						<li v-for="(k,i) in item" :key="i">
							<h2>{{k.name}}</h2>
							<ul class='r-content'>
								<li v-for="(j,idx) in k.list" :key="idx">
									<img :src="j.imgUrl" alt="">
									<span>{{j.name}}</span>
								</li>
								
							</ul>
						</li>
					</ul>
				</div>
				
			</div>
		</section>
		<Tabbar></Tabbar>
		
	</div>
</template>

<script>
	import Tabbar from "@/components/common/Tabbar.vue"
	import http from '@/common/api/request.js'
	// 页面滚动的插件
	import BetterScroll from 'better-scroll'
	export default {
	  name: "List",
	  data () {
	  	  return {
			  isShow:true,
	  		leftData:[],//左侧数据
	  		rightData:[],//右侧数据
			rightBScroll:'',//右侧滑动
			allHeight:[],	//记录右侧每一块的高度值
			scrollY:'',		//右侧滚动距离
	  	  }
	    },
		computed:{
				currentIndex(){
					return this.allHeight.findIndex((item, index)=>{
						return this.scrollY >= item && this.scrollY < this.allHeight[index+1]
					})
				}
		},
	  components:{
	  	  Tabbar,
	  	},
		
		async created(){
			let res=await http.$axios({
				url:'/api/goods/list',
				
			})
			// console.log(res)	//所有数据
			let leftArr=[];
			let rightArr=[];
			res.forEach(v=>{
				leftArr.push({
					id:v.id,
					name:v.name
				})
				rightArr.push(v.data)
			})
			this.leftData=leftArr;
			this.rightData=rightArr;
			this.$nextTick(()=>{
					// section部分 滚动
					// 左侧滑动
					 new BetterScroll(this.$refs.left, {
						click:true,
						bounce:false
					})	
					// 右侧滑动
					this.rightBScroll=new BetterScroll(this.$refs.right,{
						click:true,
						probeType:3,
						bounce:false
					})
					// 统计右侧板块高度值，并放入数组
					let height=0;
					this.allHeight.push(height);
					// 获取右侧每一块的高度
					let uls=this.$refs.right.getElementsByClassName('shop-list');
					// 把dom对象转换成功真正的数组
					Array.from(uls).forEach(v=>{
						height += v.clientHeight
						this.allHeight.push( height )
					})
					//得到右侧滚动的距离
					this.rightBScroll.on('scroll',(pos)=>{
						this.scrollY=Math.abs(pos.y);
						if(Math.abs( pos.y ) >= 50){
							this.isShow=false;
						}else{
							this.isShow=true;
						}
					})
			})
		},
		methods:{
			goBack(){
				this.$router.back();
			},
			goScroll(index){
				this.rightBScroll.scrollTo(0,-this.allHeight[index],300);
			},
			gohome(){
				this.$router.push('/home');
			},
		},
	
	};
</script>

<style scoped lang="scss">
	.list{
		display: flex;
		flex-direction: column;
		width: 100vw;
		height: 100vh;
		overflow: hidden;
	}
	header{
		width: 100%;
		height: 52px;
		display: flex;
		justify-content: space-between;
		align-items: center;
		background-color:beige;
		color: #fff;
		.search-return{
			padding: 0 10px;
			i{
				font-size: 25px;
			}
		}
		.search-main{
			display: flex;
			align-items: center;
			width: 246px;
			height: 33px;
			border-radius: 5px;
			background-color: #fff;
			i{
				padding: 0 16px;
				color: #ccc;	
			}
			span{
				color: #ccc;
				font-size: 15px;
			}
		}
		.go-home{
			padding: 0 10px;
			line-height: 17px;
			img{
				width: 35px;
				height: 35px;
				color: #000;;
			}
		}
	}
	
	section{
		flex:1;
		overflow: hidden;
		display: flex;
	}
	.list-l{
		width: 60px;
		background-color: #fff;
		overflow: hidden;
		border-right: 1px solid #e6e6e6;
		.l-item{
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items:center;
			li{
				width: 100%;
				margin: 10px;
				font-size: 17px;
				line-height: 50px;
				text-align: center;
				&.active{
					color: #f4ea2a;
					border-left: 6px solid #f4ea2a;
				}
			}
		}
	}
	.list-r{
		flex: 1;
		overflow: hidden;
		.shop-list{
			text-align: center;
			h2{
				padding: 7px 0px;
				font-size: 20px;
				font-weight: 500;
			}
			.r-content{
				display: flex;
				flex-wrap: wrap;
				li{
					display: flex;
					flex-direction: column;
					justify-content: center;
					align-items: center;
					width: 33.3%;
					padding: 7px 0px;
					img{
						width: 65px;
						height: 60px;
						border-radius: 50%;
					}
					span{
						font-size: 15px;
						font-weight: 400;
						padding: 4px 0px;
					}
				}
			}
		}
	}
	::v-deep.tabber{
		border-top:1px solid #e6e6e6;
	}
</style>
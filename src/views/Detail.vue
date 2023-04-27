<template>
	<div class="detail">
		<!-- 顶部导航 -->
		<header>

			<div class='header-returns' v-show='isShow'>
				<div @click='goBack'>
					<i class="iconfont icon-fanhui"></i>
				</div>
				<div>
					<i class="iconfont icon-zhuye"></i>
				</div>
				
			</div>
			<div 
				class='header-bar' 
				v-show='!isShow'
				:style='styleOption'
			>
				<div @click='goBack'>
					<i class='iconfont icon-fanhui'></i>
				</div>
				<div>
					<span>商品详情</span>
					<span>商品评价</span>
				</div>
				<div>
					<i class='iconfont icon-zhuye'></i>
				</div>
			</div>
		</header>
		<section ref='wrapper'>
			<div>
				<!-- 轮播 -->
				<div class="swiper-main">
					<swiper :options="swiperOption">
					  <swiper-slide 
						v-for='(item,index) in swiperList' 
						:key='index'
					   >
						<img :src="item.imgUrl" alt="">
					  </swiper-slide>
					</swiper>
					<div class="swiper-pagination"></div> 
				</div>
				
				<!-- 商品细节 -->
				<div class='goods-name'>
					<h1>{{goods.name}}</h1>
					<div>性价首选，茶感十足、鲜醇耐泡的大众口粮茶</div>
				</div>
				<div class='goods-price'>
					<!-- 现价 -->
					<div class='oprice'>
						<span>¥</span>
						<b>{{goods.price}}</b>
					</div>
					<!-- 原价 -->
					<div class='pprice'>
						<span>价格:</span>
						<del>¥{{goods.price}}</del>
					</div>
				</div>
				<!-- 详情页 -->
				<div>
				
					<img style="width: 100%;height: 300px;" :src="goods.imgUrl">
					<img style="width: 100%;height: 300px;" :src="goods.imgUrl">
					
				</div>
			</div>
			
		</section>
		
		<!-- 底部 -->
		<footer>
			<div class='add-cart' @click="addCart">加入购物车</div>
			<div>立即购买</div>
		</footer>
	</div>
</template>

<script>
import 'swiper/dist/css/swiper.css'
import { swiper, swiperSlide } from 'vue-awesome-swiper'
// 页面滚动的插件
import BetterScroll from 'better-scroll'
import http from '@/common/api/request.js'
import { Toast } from 'mint-ui';
	export default {
	  name:'Detail',
	  
	  data(){
	    return{
			id:0,
			goods:{},
			isShow:true,
			styleOption:{},
			BetterScroll:'',
			swiperOption: {//swiper3
				autoplay: 3000,
				speed: 1000,
				// 小圆点
				pagination: {
					el: '.swiper-pagination',
					type:'fraction'
				}
			},
			swiperList:[
				{
					imgUrl:'./images/list1.jpg'
				},
				{
					imgUrl:'./images/list2.jpg'
				},
				{
					imgUrl:'./images/list3.jpg'
				}
			]
	    }
	  },
	  components: {
	    swiper,
	    swiperSlide
	  },
	  created(){	
		  // 接受 首页点击事件传来的id
	  		this.id = this.$route.query.id;	  		
	  		this.getData();
	  	},
	  methods:{
		  
		  async getData(){
			let id = this.$route.query.id;
			let res = await http.$axios({
				url:'/api/goods/id',
				params:{
					id
				}
			})
			this.goods = res;
		},
		// 回到首页
		goBack(){
			this.$router.push('/home');
		},
		// 加入购物车
		addCart(){
			let id = this.$route.query.id;
			http.$axios({
				url:'/api/addCart',
				method:"post",
				data:{
					goodsId:id
				},
				headers:{
					token:true
				}
			}).then(res=>{
				// console.log(res)
				if(res.success){
					Toast('加入购物车成功');
				}
			})
		}
	  },
	  mounted(){
		  // section部分 滚动
		  this.BetterScroll = new BetterScroll(this.$refs.wrapper, {
			  probeType:3,
			  // 取消滚动事件的 弹性效果
			  bounce:false,
			  click:true,
		  })
		  this.BetterScroll.on('scroll',(pos)=>{
			let posY = Math.abs( pos.y );
			let opacity = posY / 180;
			
			opacity = opacity > 1 ? 1 : opacity;
			// 渐变效果实现切换
			this.styleOption = {
				opacity:opacity
			}
			// 滚动长度大于180 头部导航内容切换	
			if( posY >= 50 ){
				this.isShow = false;
			}else{
				this.isShow = true;
			}
		})
	  },
	  activated(){
	  		
	  		//判断当前url , id和之前浏览过的id是否一致
	  		if(  this.$route.query.id != this.id ){
				// 不一致，再次发送请求
	  			this.getData();
	  			this.id = this.$route.query.id;
	  		}
	  		
	  	},
	}
</script>

<style scoped lang="scss">
	.detail{
		display: flex;
		flex-direction: column;
		width: 100vw;
		height: 100vh;
		overflow: hidden;
	}
	// 头部
	header{
		position: fixed;
		width: 100%;
		height: 52px;
		left: 0;
		top: 0;
		z-index: 999;
		.header-returns{
			display: flex;
			justify-content: space-between;
			align-items: center;
			width: 100%;
			height: 52px;
			div{
				margin: 0 9px;
				width: 36px;
				line-height: 31px;
				text-align: center;
				background-color: rgba(0,0,0,0.2);
				border-radius: 50%;
			}
			i{
				color: #fff;
				font-size: 28px;
			}
		}
		.header-bar{
				display: flex;
				justify-content: space-between;
				align-items: center;
				width: 100%;
				height: 52px;
				font-size:17px;
				background-color: beige;
				span{
					padding:0 16px;
				}
				i{
					// padding:0 9px;
					margin: 0 9px;
					font-size:28px;
				}
			}
	}
	
	section{
		flex:1;
		overflow: hidden;
	}
	.swiper-main{
		position: relative;
		width: 100%;
		height:300px;
		overflow: hidden;
	}
	.swiper-container{
		width: 100%;
		height: 300px;
	}
	.swiper-main img{
		width: 100%;
		height: 300px;
	}
	.swiper-pagination{
		width: 100%;
		bottom:3px;
		text-align: right;
		color: #fff;
		font-size: 14px;
	}
.swiper-pagination-fraction, .swiper-pagination-custom, .swiper-container-horizontal > .swiper-pagination-bullets{
	left:-8px;
}

.goods-name{
	padding: 5px 5px;
	border-bottom: 1px solid #e6e6e6;
	h1{
		font-size: 20px;
		font-weight: 500;
	}
	div{
		padding-top: 3px;
		font-size: 14px;
		color: #676767;
	}
}
.goods-price{
	padding: 5px 5px;
	.oprice{
		font-size: 17px;
		color:red;
	}
	.pprice{
		color:#999;
		font-size: 14px;
	}
}
	footer{
		position: fixed;
		bottom: 0;
		left: 0;
		width: 100%;
		height: 56px;
		background-color: #fff;
		display: flex;
		justify-content: center;
		align-items: center;
		border-top: 1px solid #e6e6e6;
		div{
			width: 50%;
			line-height: 56px;
			font-size: 17px;
			font-weight: 500;
			text-align: center;
			background-color: firebrick;
			&.add-cart{
				background-color: #f4931c;
			}
		}
	}
</style>
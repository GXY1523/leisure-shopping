<template>
	<div class="order container" >
		<Header>
			<span >确认订单</span>
		</Header>
		<section>
			<div class="path">
				<h3 class="path-title">收货信息</h3>
				<div class="path-content" @click="goPath">
					<div>
						<span>{{path.name}}</span>
						<span>{{path.tel}}</span>
					</div>
					<div>
						<span>{{path.province}}</span>
						<span>{{path.city}}</span>
						<span>{{path.county}}</span>
						<span>{{path.addressDetail}}</span>
					</div>
				</div>
			</div>
			<div class="payment">
				<div class="payment-title">支付方式：</div>
				<van-radio-group v-model="radio">
				  <van-radio name="wx">微信支付</van-radio>
				  <van-radio name="ali">支付宝支付</van-radio>
				</van-radio-group>
			</div>
			<div class="goods">
				
				<ul>
					<li v-for="(item,index) in goodsList" :key="index">
						<div>
							<img :src="item.goods_imgUrl" alt="">
							
						</div>
						<div class="goods-content">
							<h4>{{item.goods_name}}</h4>
							<div class="goods-total">
								<span>￥{{item.goods_price}}</span>
								<span>×{{item.goods_num}}</span>
							</div>
						</div>
					</li>
				</ul>
			</div>
		</section>
		<footer>
			<div class="order-total">
				<span>共</span>
				<b>{{total.num}}</b>
				<span>件，总金额：</span>
				<em>¥{{total.price}}</em>
			</div>
			<div class="order-topay" @click='goPayment'>
				提交订单
			</div>
		</footer>
	</div>
</template>

<script>
	import Header from '@/components/login/Header.vue'
	import { mapMutations,mapState,mapGetters } from 'vuex';
	import http from '@/common/api/request.js'
	import { Toast } from 'vant';
	import bus from '@/common/bus'
	import qs from 'qs'
	export default{
		name:"order",
		data() {
		    return {
		      radio: 'wx',
			  path:{},
			  item:[],
			  total:{
				  price:0,
				  num:0
			  }
		    };
		  },
		components:{
		  Header,
		},
		computed:{
			...mapState({
				order_id:state=>state.order.order_id,
				selectList:state=>state.cart.selectList
			}),
			...mapGetters(['defaultPath']),
			
		},
		created(){
			this.goodsList = JSON.parse( this.$route.query.goodsList );
			this.selectAddress()
	
		},
		activated() {
			// 接收 收货地址页面 传递过来的地址选择信息
			bus.$on('selectPath',function(data){
				this.path=JSON.parse(data);
			}.bind(this));
			
			// this.$route.query 购物车页面传递过来的商品id
			// console.log(this.$route.query.detail)
			this.item = JSON.parse( this.$route.query.detail )
			this.goodsList = JSON.parse( this.$route.query.goodsList );
			
			this.selectOrder()
		},
		methods:{
			...mapMutations(['initData','initOrder']),
			// 进入收货地址页面
			goPath(){
				this.$router.push({
					path:'/path',
					query:{
						type:'select'
					}
				})
			},
			// 提交订单
			goPayment(){
				if(!this.path){
					return Toast('请填写收货地址')
				}
				// 向后端发送请求，将订单状态改为2，删除购物车相应数据
				http.$axios({
					url:'/api/submitOrder',
					method:"post",
					headers:{
						token:true
					},
					data:{
						order_id:this.order_id,
						shopArr:this.selectList
					}
				}).then(res=>{
					// 支付 需要传递的信息
					let newArr=[];
					this.goodsList.forEach(v=>{
						newArr.push(v.goods_name)
					})
					let dataOrder={
						order_id:this.order_id,
						name:newArr.join(''),
						price:this.total.price
					}
					// 支付
					if(res.success){
						http.$axios({
							url:'/api/payment',
							method:"post",
							headers:{
								token:true,
								'Content-Type': 'application/x-www-form-urlencoded'
							},
							// json.stringify() 将转化为json格式的字符串。
							// data:json.stringify(dataOrder)
							// qs是增加安全性的序列化 qs.stringify() 将对象转化为url形式的字符串。
							data:qs.stringify(dataOrder)
						}).then(res=>{
							// console.log(res)
							if(res.success){
								window.location.href=res.paymentUrl

							}
						})
					}
				})
				
			},
			// 查询订单
			selectOrder(){
				http.$axios({
					url:'/api/selectOrder',
					method:"post",
					headers:{
						token:true
					},
					data:{
						order_id:this.order_id
					}
				}).then(res=>{
					// console.log(res)
					this.initOrder(res.data);
					            
					this.total = {
						price : res.data[0].goods_price,
						num : res.data[0].goods_num
					}
				})
			},
			// 查询到地址
			selectAddress(){
				http.$axios({
					url:'/api/selectAddAddress',
					method:"post",
					headers:{
						token:true
					}
				}).then(res=>{
					// console.log(res)
					this.initData( res.data );
					//有默认收货地址
					if( this.defaultPath.length ){
						this.path = this.defaultPath[0];
					}else{
						this.path = res.data[0];
					}
				})
			},
		}
	}
</script>

<style scoped lang="scss">
	section{
		background-color: #f4f4f4;
		font-size: 15px;
		.path{
			.path-title{				
				padding: 8px 6px;
				
				font-weight: 500;
			}
			.path-content{
				padding: 18px 6px;
				
				background-color: #fff;
				span{
					padding-right: 10px;
				}
			}
		}
		.payment{
			margin-top: 10px ;
			padding: 4px 6px;
			
			font-weight: 500;
			background-color: #fff;
			.van-radio-group{
				display: flex;
				padding: 15px 6px;
				.van-radio{
					padding-right: 20px;
				}
			}
		}
		.goods{
			margin-top: 10px ;
			padding: 4px 6px 0 6px;
			
			font-weight: 500;
			background-color: #fff;
			ul{
				width: 100%;
				li{
					padding: 4px 0;
					display: flex;
					width: 100%;
					border-bottom: 1px solid #e6e6e6;
					img{
						width: 85px;
						height: 85px;
					}
					.goods-content{
						padding-left: 10px;
						flex: 1;
						display: flex;
						flex-direction: column;
						justify-content: space-between;
						h4{
							font-weight: 500;
							overflow:hidden;
							
							text-overflow:ellipsis;
							display:-webkit-box;													
							-webkit-line-clamp:1;	
							-webkit-box-orient:vertical;
						}
						.goods-total{
							display: flex;
							justify-content: space-between;
							
						}
						
					}
				}
			}
			
		}
	}
	footer{
		display: flex;
		justify-content: space-between;
		align-items: center;
		width: 100%;
		height: 56px;
		border-top: 1px solid #e6e6e6;
		.order-total{
			
			span{
				font-size:14px;
				padding: 0 6px;
			}
			b,em{
				color: #97292f;
			}
			em{
				font-size:17px;
			}
		}
		.order-topay{
			width: 100px;
			line-height: 56px;
			text-align: center;
			background-color:#97292f ;
			color:#fff;
			font-size: 17px;
		}
	}
</style>
<template>
	<div class="cart container">
		<header>
			<i class="iconfont icon-fanhui" @click="$router.push('./home')"></i>
			<span>购物车</span>
			<span @click='isNavBar' v-text='isNavStatus ? "完成" : "编辑"'></span>
		</header>
		<section v-if='list.length'>
			<div class='cart-title'>
				<van-checkbox :value="isCheckAll" @click="checkAllFn"></van-checkbox>
				<span>商品</span>
			</div>
			<ul>
				<li v-for="(item,index) in list" :key="index">
					<!-- {{item}} -->
					<div class="check">
						<van-checkbox @click="checkItem(index)" v-model="item.checked" ></van-checkbox>
					</div>
					<div>
						<img :src="item.goods_imgUrl" alt="">
					</div>
					<div class="goods">
						<div class="goods-title">
							<!-- 西风吹老洞庭波，一夜湘君白发多。 -->
							<span>{{item.goods_name}}</span>
							<i class="iconfont icon-shanchu" @click='delGoodsFn(item.id)'></i>
							
						</div>
						<div class="goods-price">￥{{item.goods_price}}</div>
						<van-stepper @change='changeNum($event,item)' v-model="item.goods_num" integer/>
					</div>
				</li>
				
			</ul>
		</section>
		<section v-else>
			购物车还是空空的
			<router-link to='/home'>去首页逛逛吧</router-link>
		</section>
		<footer v-if='list.length'>
			<div class="radio">
				<van-checkbox :value="isCheckAll" @click="checkAllFn"></van-checkbox>
			</div>
			<div class="total" v-show="!isNavStatus">
				<div>
					已选
					<span class="total-active">{{total.num}}</span>
					件商品
				</div>
				<div>
					<span>合计：</span>
					<span class="total-active">¥{{total.price.toFixed(2)}} + 0茶币</span>
				</div>
			</div>
			<div class="order" v-if="isNavStatus" @click='delGoodsFn'>删除</div>
			<div class="order" v-else  @click='goOrder'>去结算</div>
		</footer>
	</div>
</template>

<script>
import { mapMutations,mapState,mapActions,mapGetters } from 'vuex';
import http from '@/common/api/request.js'
import { Toast } from 'vant';
	export default {
	  name: "Cart",
	  data(){
		  return {
			  checked:true,
			  isNavStatus:false,
		  }
	  },
	  computed:{
		...mapState({
			list:state=>state.cart.list,
			selectList:state=>state.cart.selectList
		}),
		...mapGetters(['isCheckAll','total']),
		goodsList(){
			return this.selectList.map(id=>{
				return this.list.find(v=>v.id==id);
			})
		}
	  },
	  created() {
	  	this.getData();
	  },
	  methods:{
		  ...mapMutations(['cartList','checkItem','initOrder']),
		  ...mapActions(['checkAllFn','delGoodsFn']),
		  async getData(){
			  let res=await http.$axios({
				  url:'/api/selectCart',
				  method:'post',
				  headers:{
					  token:true
				  }
			  })
			  // 物品 默认全选
			  res.data.forEach(v=>{
				  v['checked']=true;
			  })
			  this.cartList(res.data)
			  // console.log(res);
		  },
		  // 点击 编辑|退出编辑 按钮
		  isNavBar(){
			  
			  this.isNavStatus=!this.isNavStatus;
			  
		  },
		  // 修改商品数量
		  changeNum(value,item){
			  // 当前 购物车商品的 id以及  修改后的数量  传递给后端
			  //value 就是修改后的数量
			  //item.id 就是购物车商品的id
			  http.$axios({
				  url:'/api/updateNum',
				  method:'post',
				  headers:{
					  token:true,
				  },
				  data:{
					  id:item.id,
					  num:value
				  }
			  })
		  },
			
		  // 结算
		   goOrder(){
			   if(!this.selectList.length){
				   Toast('请选择 结算的商品');
					return;
			   }
			   
			   let newList=[];
			   this.list.forEach(item=>{
				   this.selectList.filter(v=>{
					   if(v==item.id){
						   newList.push(item)
					   }
				   })
			   })
			   
			   // 生成订单
			   http.$axios({
			   	url:'/api/addOrder',
			   	method:"post",
			   	headers:{
			   		token:true
			   	},
				data:{
					arr:newList
				}
			   }).then(res=>{
				   // console.log(res.data)
					if(!res.success) return;
					//存储订单号
					this.initOrder(res.data);
					// 进入 提交订单页面
					this.$router.push({
					   path:'/order',
					   // 将选择的商品信息 一起传递
					   query:{
						   detail:JSON.stringify( this.selectList ),
						   goodsList:JSON.stringify( this.goodsList )
					   }
					})
			   })
			   
			   
		   }
	  }
	};
</script>

<style scoped lang="scss">
	header{
		display: flex;
		justify-content: space-between;
		align-items: center;
		width: 100%;
		height: 52px;
		background-color:beige;
		color: #f6b42f;
		i{
			padding: 0 10px;
			font-size: 25px;
			color: #fff
		}
		span{
			font-size: 17px;
			padding: 0 10px;
		}
	}
	section{
		background-color: #f4f4f4;
		.cart-title{
			display: flex;
			padding: 4px 6px;
			span{
				padding: 0 5px;
				font-weight: 500;
				font-size: 15px;
			}
		}
		ul{
			display: flex;
			flex-direction: column;
			li{
				display: flex;
				justify-content: space-between;
				align-items: center;
				padding: 9px 6px;
				margin: 5px 0;
				background-color: #fff;
				.check{
					padding-right: 9px;
				}
				.goods{
					display: flex;
					flex-direction: column;
					padding-left:9px ;
					font-size: 15px;
					.goods-title{
						display: flex;
						i{
							font-size: 25px;
							padding-left: 2px;
							color:#6b6b6b
						}
					}
					.goods-price{
						padding:5px 0;
						color: #97292f;
					}
					::v-deep .van-stepper{
						text-align: right;
					}
				}
				img{
					width: 85px;
					height: 85px;
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
		.radio{
			padding: 0 6px;
		}
		.total{
			flex: 1;
			font-size:14px;
			.total-active{
				color: #97292f;
			}
		}
		.order{
			width: 100px;
			line-height: 56px;
			text-align: center;
			background-color:#97292f ;
			color:#fff;
			font-size: 17px;
		}
	}
</style>
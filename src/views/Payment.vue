<template>
	<div class="payment">
		<div v-if='payStatus'>支付成功</div>
		<div v-else>支付失败</div>
		
	</div>
</template>

<script>
	import http from '@/common/api/request.js'
	import qs from 'qs'
	export default{
		name:'Payment',
		data () {
			return {
				payStatus : false
			}
		},
		created(){
			this.getData()
		},
		methods:{
			getData(){
				let datas={
					// 订单号
					out_trade_no:this.$route.query.out_trade_no,
					trade_no:this.$route.query.trade_no
				}
				http.$axios({
					url:'/api/successPayment',
					method:"post",
					headers:{
						token:true,
						'Content-Type': 'application/x-www-form-urlencoded'
					},
					
					data:qs.stringify(datas)
				}).then(res=>{
					console.log(res)
					if(res.code==2){
						this.payStatus=true;
					}
				
				})
			}
			
		}
	}
</script>

<style>
</style>
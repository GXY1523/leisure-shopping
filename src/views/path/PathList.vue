<template>
	<div class="pathIndexx container">
		<Header>
			<span v-if="pathStatus">添加收货地址</span>
			<span v-else>编辑收货地址</span>
		</Header>
		<section>
			<van-address-edit
			v-if="pathStatus"
			  :area-list="areaList"
			  show-delete  
			  show-set-default
			  show-search-result
			  :search-result="searchResult"
			  
			  @save="onSave"
			  @delete="onDelete"
			  @change-detail="onChangeDetail"
			/>
			<van-address-edit
			v-else
			  :area-list="areaList"
			  :address-info="AddressInfo"
			  show-delete  
			  show-set-default
			  show-search-result
			  :search-result="searchResult"
			  
			  @save="onUpdate"
			  @delete="onDelete"
			  @change-detail="onChangeDetail"
			/>
		</section>
		<Tabbar></Tabbar>
	</div>
</template>

<script>
	import Header from '@/components/login/Header.vue'
	import Tabbar from "@/components/common/Tabbar.vue"
	import { Toast } from 'vant';
	import http from '@/common/api/request.js'
	export default{
		name:'PathList',
		data() {
		    return {
				pathStatus:false,
				// 收货人信息初始值
				AddressInfo:{},
				// 地区列表
		      areaList:{
				  province_list: {
				      110000: '北京市',
				      120000: '天津市',
				    },
				    city_list: {
				      110100: '北京市',
				      120100: '天津市',
				    },
				    county_list: {
				      110101: '东城区',
				      110102: '西城区',
				      // ....
				    },
			  },
		      searchResult: [],
		    };
		  },
		components:{
		  Tabbar,
		  Header,
		},
		mounted(){
			let key = JSON.parse(this.$route.params.key);
			//是通过添加进来的
			if( key == 'add' ){
				this.pathStatus = true;
			}else{//编辑进来的
			// console.log(key)
				this.AddressInfo = key;
				// 再次编辑地址，使得 默认地址按钮显示样式
				this.AddressInfo.isDefault = this.AddressInfo.isDefault == 1 ? true : false;
			}
			
		},
		methods: {
		    onSave(content) {
		      // console.log(content)
			  content.isDefault=content.isDefault==true?1:0;
			  http.$axios({
				  
			  	url:'/api/addAddress',
			  	method:'post',
				headers:{
					token:true
				},
			  	data:{
			  		...content
			  	}
			  }).then(res=>{
				  // console.log(res)
				 
				  if( !res.success ) return;
				  // console.log(res)
				  Toast(res.msg);
				  this.$router.push('/path');
			  })
			  
		    },
			// 修改地址
			onUpdate(content){
				content.isDefault=content.isDefault==true?1:0;
				http.$axios({								  
					url:'/api/updateAddress',
					method:'post',
						headers:{
							token:true
						},
					data:{
						...content
					}
				}).then(res=>{
					  // console.log(res)					 
					  if( !res.success ) return;
					  
					  Toast(res.msg);
					  this.$router.push('/path');
				})
			},
		    onDelete(content) {
		      http.$axios({
		      	url:'/api/deleteAddress',
		      	method:'post',
		      		headers:{
		      			token:true
		      		},
		      	data:{
		      		id:content.id
		      	}
		      }).then(res=>{
		      	  // console.log(res)					 
		      	  if( !res.success ) return;
		      	  
		      	  Toast(res.msg);
		      	  this.$router.push('/path');
		      })
		    },
			// 修改详细地址时触发
		    onChangeDetail(val) {
		      if (val) {
		        this.searchResult = [
		          {
		            name: '黄龙万科中心',
		            address: '杭州市西湖区',
		          },
		        ];
		      } else {
		        this.searchResult = [];
		      }
		    },
		  },
	}
</script>

<style scoped lang="scss" >
	section{
		background-color: #f4f4f4;
		display: flex;
		flex-direction: column;
		align-items: center;
		
		::v-deep .van-switch--on{
			background-color: #f6b42f;
		}
		::v-deep .van-button--danger{
				
				background-color: #f6b42f;
				border: #f6b42f;
			}
	}
	

		
</style>
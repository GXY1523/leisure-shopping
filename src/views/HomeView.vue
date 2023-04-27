<template>
  <div class="home">
	  <div class="headers">
		  <div class="headers-main">
			  <Header></Header>
			  <!-- 主页的 导航栏 -->
			  <ly-tab
				v-model="selectedId"
				:items="items"
				:options="options"
				@change='changeTab'
			>
			</ly-tab>
			  <!-- <ly-tab-bar v-model="value" :activeColor="options.activeColor"> -->
				<!-- <ly-tab-item 
				 v-for="(item,index) in lytabList" :key="index" 
				 :name="item.name" 
				 :title="item.title"
				  @change="changeTab"/> -->
			    <!-- <ly-tab-item @change="changeTab" name="1" title="推荐" />
			    <ly-tab-item @change="changeTab" name="2" title="大红袍" />
			    <ly-tab-item @change="changeTab" name="3" title="绿茶" />
			    <ly-tab-item @change="changeTab" name="4" title="铁观音" />
				<ly-tab-item @change="changeTab" name="5" title="普洱" />
				<ly-tab-item @change="changeTab" name="6" title="茶具" />
				<ly-tab-item @change="changeTab" name="7" title="花茶" />
			  </ly-tab-bar> -->
		  </div>
		  
	  </div>
	  
	  
	  <!-- 主体内容 -->
	  <section ref="wrapper">
		  <div>
			  <div v-for="(item,index) in newData" :key="index">
				  <Swiper 
					v-if="item.type=='swiperList'"
					:swiperList='item.data'></Swiper>
				  <Icons v-if="item.type=='iconsList'"
					:iconsList='item.data'></Icons>
				  <Recommend v-if="item.type=='recommendList'"
					:recommendList='item.data'></Recommend>
				  
				  <Ad v-if="item.type=='adList'"
					:adList='item.data'></Ad>
				  <Like v-if="item.type=='likeList'"
					:likeList='item.data'></Like>
			  </div>
			  
		  </div>
		  
	  </section>
    
	<Tabbar></Tabbar>
  </div>
</template>

<script>
import Tabbar from "@/components/common/Tabbar.vue"
import Header from "@/components/home/Header.vue"
import Swiper from "@/components/home/Swiper.vue"
import Icons from "@/components/home/Icons.vue"
import Like from "@/components/home/Like.vue"
import Ad from "@/components/home/Ad.vue"
import Recommend from "@/components/home/Recommend.vue"
import axios from "axios"
// 页面滚动的插件
import BetterScroll from 'better-scroll'

import http from '@/common/api/request.js'
export default {
  name: "HomeView",
  data() {
    	return  {
    	  selectedId: 0,
		  items:[],
		  options:{
			  activeColor:"#f4ea2a",
			  reBoundingDuration:360,
		  },
		  
		  newData:[],
		  // wipper部分的滚动
		  oBetterScroll:'',
			tBetterScroll:'',
    	}
  },
  
  components:{
	  Tabbar,
	  Header,
	  Swiper,
	  Icons,
	  Recommend,
	  Like,
	  Ad,
	},
	created(){
		this.getData();
	},
	
	methods:{
		async getData(){
			
			let res=await http.$axios({
				url:'/api/index_list/0/data/1'
			});
			// this.items=res.data.data.topBar
			// 这样写性能会好一点
			// Object.freeze() 方法可以冻结一个对象。
			// 一个被冻结的对象再也不能被修改；冻结了一个对象则不能向这个对象添加新的属性，
			// 不能删除已有属性，不能修改该对象已有属性的可枚举性、可配置性、可写性，以及不能修改已有属性的值。
			// 此外，冻结一个对象后该对象的原型也不能被修改。freeze() 返回和传入的参数相同的对象。
			this.items = Object.freeze(res.topBar);
			this.newData=Object.freeze(res.data);

			this.$nextTick(()=>{			
					// section部分 滚动
					this.oBetterScroll = new BetterScroll(this.$refs.wrapper, {
						movable:true,
						zoom:true,
						click:true,
					})				
			})
			
			
		},
		async addData( index ){
				
				let res = await http.$axios({
					url:'/api/index_list/'+index+'/data/1'
				});
				
				if(  res.constructor !=Array ){
					this.newData = res.data;
				}else{
					this.newData = res;
				}
				this.$nextTick(()=>{
					
						// section部分 滚动
						this.tBetterScroll = new BetterScroll(this.$refs.wrapper, {
							movable:true,
							zoom:true,
							click:true,
						})
					
				})
				
			},
			changeTab(item,index){
				this.addData(index)
			}
	}
  
};
</script>
<style scoped>
	.home{
		width: 100vw;
		height: 100vh;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}
	.headers{

		width: 100%;
		height: 102px;
	}
	.headers-main{
		width: 100%;
		position: fixed;
		left: 0;
		top: 0;
	}
	

	section{
		flex: 1;
		overflow: hidden;
		width: 100%;
	}
	::v-deep .ly-tabbar{
		box-shadow:none;
		border-bottom:none;
	}

</style>

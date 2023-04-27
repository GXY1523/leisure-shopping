<template>
	<header>
		<div class="search-return" @click='goBack'>
			<i class="iconfont icon-fanhui"></i>
		</div>
		<div class="search-main">
			<i class="iconfont icon-sousuo_o"></i>
			<form action="" onsubmit="return false" @keyup.enter="goSearchList">
				<input type="search" placeholder="快来看!" v-model="searchVal" autofocus ref="myInput">
			</form>
			
		</div>
		<div class="search-btn" @click='goSearchList'>
			搜索
		</div>
	</header>
</template>

<script>
	export default{
		data(){
			return{
				// 搜索框输入的内容
				searchVal:this.$route.query.key || '',
				searchArr:[]
			}
		},
		mounted() {
			// 键盘监听事件
			window.addEventListener("touchmove",this.myTouchMove,true);
		},
		methods:{
			// 键盘失去焦点 收起
			myTouchMove(){
					this.$refs.myInput.blur();
			},
			goBack(){
				this.$router.back()
			},
			goSearchList(){
				// 对搜索框输入的内容进行判断
				// 搜索为空
				if(!this.searchVal) return;
				
				// 判断之前是否搜索过该内容
				if(!localStorage.getItem('searchList')){
					// 没有
					localStorage.setItem('searchList','[]')
				}else{
					// 有
					this.searchArr=JSON.parse(localStorage.getItem('searchList'))
				}
				
				// 增加数据
				this.searchArr.unshift(this.searchVal)
				// es6去重
				let newArr = new Set(this.searchArr)
				// 给本地存储赋值
				localStorage.setItem('searchList',JSON.stringify(Array.from(newArr)))
				// 若 搜索内容无变化，不跳转
				if(this.searchVal===this.$route.query.key) return
				
				// 页面跳转
				this.$router.push({
					name:'list',
					// 将搜索内容也传过去
					query:{
						key:this.searchVal
					}
				})
			}
		}
	}
</script>

<style scoped lang="scss">
	header{
		width: 100%;
		height: 52px;
		display: flex;
		justify-content: space-between;
		align-items: center;
		background-color:beige;
		color: #fff;
	}
	.search-return,.search-btn{
		padding: 0 10px;
	}
	.search-return i{
		font-size: 25px;
	}
	.search-btn{
		font-size: 17px;
		
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
		form{
			display: flex;
			justify-content: center;
			align-items: center;
			width: 100%;
			input{
				width: 100%;
				color: #ccc;
				font-size: 15px;
			}
		}
	}
	
	
</style>
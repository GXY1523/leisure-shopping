import Vue from "vue";
import VueRouter from "vue-router";
import HomeView from "@/views/HomeView.vue";


Vue.use(VueRouter);
const originalPush = VueRouter.prototype.push
const originalReplace = VueRouter.prototype.replace
// push
VueRouter.prototype.push = function push (location, onResolve, onReject) {
  if (onResolve || onReject) return originalPush.call(this, location, onResolve, onReject)
  return originalPush.call(this, location).catch(err => err)
}
// replace
VueRouter.prototype.replace = function push (location, onResolve, onReject) {
  if (onResolve || onReject) return originalReplace.call(this, location, onResolve, onReject)
  return originalReplace.call(this, location).catch(err => err)
}

const routes = [
  {
    path: "/home",
    name: "home",
    component: HomeView,
  },
  {
    path: "/",
    redirect: "/home",
  },
  {
    path: "/list",
    name: "List",
    
    component: () =>
      import("../views/List.vue"),
  },
  {
    path: "/cart",
    name: "Cart",
    
    component: () =>
      import("../views/Cart.vue"),
  },
  {
    path: "/my",
    name: "My",
    
    component: () =>
      import("../views/My.vue"),
  },
  {
    path: "/search",
    name: "Search",
    children:[
		{
		  path: "/",
		  name: "index",
		  component: () =>
		    import("../views/search/Search-index.vue"),
		},
		{
		  path: "list",
		  name: "list",
		  component: () =>
		    import("../views/search/Search-list.vue"),
		}
	],
    component: () =>
      import("../views/Search.vue"),
  },
  {
    path: "/detail",
    name: "Detail",
    meta:{
			keepAlive:true,	//此组件缓存
	},
    component: () =>
      import("../views/Detail.vue"),
  },
  {
    path: "/login",
    name: "Login",
    
    component: () =>
      import("../views/login/Login.vue"),
  },
  {
    path: "/rejister",
    name: "Rejister",
    
    component: () =>
      import("../views/login/Rejister.vue"),
  },
  {
    path: "/userLogin",
    name: "UserLogin",
    
    component: () =>
      import("../views/login/UserLogin.vue"),
  },
  {
    path: "/recovery",
    name: "Recovery",
    children:[
  		{
  		  path: "/",
  		  name: "index",
  		  component: () =>
  		    import("../views/recovery/RecoveryIndex.vue"),
  		},
  		{
  		  path: "btn",
  		  name: "btn",
  		  component: () =>
  		    import("../views/recovery/RecoveryBtn.vue"),
  		}
  	],
    component: () =>
      import("../views/Search.vue"),
  },
  // 地址管理
  {
    path: "/path",
    name: "Paths",
    children:[
    	{
    	  path: "/",
    	  name: "pathIndex",
    	  component: () =>
    	    import("../views/path/PathIndexx.vue"),
    	},
    	{
    	  path: "/pathList",
    	  name: "PathList",
    	  component: () =>
    	    import("../views/path/PathList.vue"),
    	},
    ],
    component: () =>
      import("../views/path/Paths.vue"),
  },
  
  // 订单
  {
    path: "/order",
    name: "Order",
    meta:{
    	keepAlive:true,	//此组件缓存
    },
    component: () =>
      import("../views/Order.vue"),
  },
  {
    path: "/payment",
    name: "Payment",
    
    component: () =>
      import("../views/Payment.vue"),
  },
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
});
router.beforeEach((to,from,next)=>{
	let nextRoute=['Payment','Order','Paths','pathIndex','PathList','Cart']
	// 判断 是否已登陆
	let userInfo=JSON.parse(localStorage.getItem('teaUserInfo'))
	if(nextRoute.indexOf(to.name)>=0){
		if(!userInfo){
			router.push('/login')
		}
	}
	next();
})

export default router;

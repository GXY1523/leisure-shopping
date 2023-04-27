import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";

// 公共css文件
import "@/assets/css/common.css"
//  iconfont
import "@/assets/css/iconfont.css"
// 淘宝无线适配
import "@/assets/js/flexible.js"

// 引入 ly-tab插件（主页那里使用）
import LyTab from 'ly-tab';
Vue.use(LyTab);
// 引入 mint-ui
import MintUI from 'mint-ui'
import 'mint-ui/lib/style.css'
Vue.use(MintUI)

import Vant from 'vant';
import 'vant/lib/index.css';

Vue.use(Vant);

import fastClick from 'fastclick'
fastClick.attach(document.body)

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount("#app");

import {INIT_ORDER} from './mutations-type.js'

export default{
	state:{
		list:[],
		order_id:localStorage.getItem('shopping_orderId') || ''
	},
	mutations:{
		[INIT_ORDER](state,orderId){
			state.list=orderId;
			state.order_id=orderId[0].order_id;
			//设置 id号
			localStorage.setItem('shopping_orderId',orderId[0].order_id);
		}
	}
}
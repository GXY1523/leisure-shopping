var express = require('express');
var router = express.Router();
var connection=require('../db/sql.js')
var user=require('../db/userSql.js')
var QcloudSms = require("qcloudsms_js");
let jwt = require('jsonwebtoken');

// 引入 支付宝配置文件
const alipaySdk=require('../db/alipay')
const AlipayFormData=require('alipay-sdk/lib/form').default
const axios = require('axios');

function getTimeToken(exp){
	let getTime=parseInt(new Date().getTime()/1000);
	if(getTime-exp>60){
		return true;
	}
}

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

// 支付状态 成功/失败
router.post('/api/successPayment',function(req, res, next){
	let token=req.headers.token;
	let tokenObj=jwt.decode(token);
	// 订单号
	let out_trade_no=req.body.out_trade_no
	let trade_no=req.body.trade_no
	// 支付宝配置
	// 对接支付宝api
	const formData = new AlipayFormData();
	// 调用 setMethod 并传入 get，会返回可以跳转到支付页面的 url
	formData.setMethod('get');
	// 支付信息
	formData.addField('bizContent',{
		out_trade_no,
		trade_no
	})
	//返回promise
	const result = alipaySdk.exec(
	  'alipay.trade.query',
	  {},
	  { formData: formData },
	);
	// 后端请求支付宝
	result.then(resData=>{
		axios({
			method:'Get',
			url:resData
		}).then(data=>{
			// console.log('data');
			// console.log(data);
			let responseCode=data.data.alipay_trade_query_response;
			if(responseCode.code=='10000'){
				switch (responseCode.trade_status){
					case 'WAIT_BUYER_PAY':
						res.send({
							data:{
								code:0,
								data:{
									msg:'支付宝有交易记录，没付款'
								}
							}
						})
						break;
					case 'TRADE_CLOSED':
						res.send({
							data:{
								code:1,
								data:{
									msg:'交易关闭'
								}
							}
						})
					break;
					case 'TRADE_FINISHED':
						connection.query(`select * from user where tel =${tokenObj.tel}`,function(error,results){
							let uId=results[0].id;
							// 查询属于该用户的该订单
							connection.query(`select * from store_order where order_id =${out_trade_no} and uid=${uId}`,function(err,resul){
								let id=resul[0].id
								connection.query(`update store_order set order_status = replace(order_status,'2','3') where id = ${id}`,function(){
									res.send({
										data:{
											code:2,
											data:{
												msg:'交易完成'
											}
										}
									})
								})
							})
						})
					break;
					case 'TRADE_SUCCESS':
					connection.query(`select * from user where tel =${tokenObj.tel}`,function(error,results){
						let uId=results[0].id;
						// 查询属于该用户的该订单
						connection.query(`select * from store_order where order_id =${out_trade_no} and uid=${uId}`,function(err,resul){
							let id=resul[0].id
							connection.query(`update store_order set order_status = replace(order_status,'2','3') where id = ${id}`,function(){
								res.send({
									data:{
										code:2,
										data:{
											msg:'交易完成'
										}
									}
								})
							})
						})
					})
						
					break;
					
				}
			}else if(responseCode.code=='40004'){
				res.send({
					data:{
						code:4,
						msg:'交易不存在'
					}
				})
			}
		})
		.catch(err=>{
			res.send({
				data:{
					code:500,
					msg:'交易失败',
					err
				}
			})
		})
	})
})

// 支付
router.post('/api/payment',function(req, res, next){
	let order_id=req.body.order_id;
	let price=req.body.price;
	let name=req.body.name;
	// 对接支付宝api
	const formData = new AlipayFormData();
	// 调用 setMethod 并传入 get，会返回可以跳转到支付页面的 url
	formData.setMethod('get');
	// 支付信息
	formData.addField('bizContent',{
		// 订单号
		outTradeNo:order_id,
		productCode:'FAST_INSTANT_TRADE_PAY',//写死的
		totalAmount: price,//价格
		subject: name,//商品名称	
	})
	 //支付成功或者失败跳转的链接
	formData.addField('returnUrl', 'http://localhost:8080/payment');
	//返回promise
	const result = alipaySdk.exec(
	  'alipay.trade.page.pay',
	  {},
	  { formData: formData },
	);
	//对接支付宝成功，支付宝返回的数据
	result.then(resp=>{
		res.send({
			data:{
				code:200,
				success:true,
				msg:'支付中',
				paymentUrl : resp
			}
		})
	})
	
})
// 向后端发送请求，将订单状态改为2，删除购物车相应数据
router.post('/api/submitOrder',function(req, res, next){
	// token
	let token=req.headers.token;
	let tokenObj=jwt.decode(token);
	//查询前端给后端的订单号
	let order_id=req.body.order_id;
	let shopArr=req.body.shopArr
	// 查询用户
	connection.query(`select * from user where tel =${tokenObj.tel}`,function(error,results){
		let uId=results[0].id;
		// 查询属于该用户的该订单
		connection.query(`select * from store_order where order_id =${order_id} and uid=${uId}`,function(err,result){
			// 订单的数据库id
			let id=result[0].id;
			// 将订单状态变为2
			connection.query(`update store_order set order_status=replace(order_status,'1','2') where id=${id}`,function(e,r){
				//删除数据库的 内容
				shopArr.forEach(v=>{
					connection.query(`delete from goods_cart where id=${v}`,function(){
						
					})
				})
				res.send({
				   data:{
					   success:true,
					   code:200,							   
				   }
				})
			})
		})
	})
})

// 查询订单
router.post('/api/selectOrder',function(req, res, next){
	//查询前端给后端的订单号
	let order_id=req.body.order_id;
	
	connection.query(`select * from store_order where order_id =${order_id}`,function(error,results){
		res.send({
		   data:{
			   success:true,
			   code:200,
			   data:results
			   
		   }
		})
	})
})
// 生成订单
router.post('/api/addOrder',function(req, res, next){
	// token
	let token=req.headers.token;
	let tokenObj=jwt.decode(token);
	// 前端给后端的数据
	let goodsArr=req.body.arr;
	// 生成订单号
	function setTimeDateFmt(s){
		return s<10 ? '0'+s : s;
	}
	function randomNumber(){
		const now =new Date();
		let month=now.getMonth()+1;
		let day = now.getDate();
		        let hour = now.getHours();
		        let minutes = now.getMinutes();
		        let seconds = now.getSeconds();
		        month = setTimeDateFmt(month);
		        day = setTimeDateFmt(day);
		        hour = setTimeDateFmt(hour);
		        minutes = setTimeDateFmt(minutes);
		        seconds = setTimeDateFmt(seconds);
		        let orderCode = now.getFullYear().toString() + month.toString() + day + hour + minutes + seconds + (Math.round(Math.random() * 1000000 )).toString();
				return orderCode;
	}
	/*
	    未支付：1
	    待支付：2
	    支付成功：3
	    支付失败：4 | 0
	    */
	   //商品列表名称
	   let goodsName=[];
	    //订单商品总金额
	   let goodsPrice=0;
	   //订单商品总数量
	   let goodsNum=0;
	   // 订单号
	   let orderId=randomNumber();
	   goodsArr.forEach(v=>{
		   goodsName.push(v.goods_name);
		   goodsPrice+=v.goods_price*v.goods_num;
		   goodsNum+=parseInt(v.goods_num);
	   })
	   // 查询当前用户
	   connection.query(`select * from user where tel =${tokenObj.tel}`,function(error,results){
		   let uId=results[0].id;
		   connection.query(`insert into store_order (order_id,goods_name,goods_price,goods_num,order_status,uid) values ('${ orderId }','${goodsName}','${goodsPrice}','${goodsNum}','1',${uId})`,function(){
			   connection.query(`select * from store_order where uid = ${uId} and order_id='${ orderId }'`,function(err,result){
				   res.send({
					   data:{
						   success:true,
						   code:200,
						   data:result
						   
					   }
				   })
			   })
		   })
	   })
})
// 删除 地址
router.post('/api/deleteAddress',function(req, res, next){
	let id=req.body.id;
	connection.query(`delete from address where id=${id}`,function(error,results){
		res.send({
			data:{
				code:200,
				success:true,
				 msg:'删除成功'
			}
			
		})
	})
})

// 修改地址
router.post('/api/updateAddress',function(req, res, next){
	// token
	let token=req.headers.token;
	let tokenObj=jwt.decode(token);
	let body=req.body;
	let [id,name,tel,county,province,city,addressDetail,isDefault,areaCode]=[
		body.id,
		body.name,
		body.tel,
		body.county,
		body.province,
		body.city,
		body.addressDetail,
		body.isDefault,
		 body.areaCode
	];
	connection.query(`select * from user where tel =${tokenObj.tel}`,function(error,results){
		let uId=results[0].id;
		//对应查询到0 或者 1 有没有默认收货地址
		connection.query(`select * from address where uid = ${uId} and isDefault = ${isDefault}`,function(err,result){
			if(result.length>0){
				 let addressId = result[0].id;
				 connection.query(`update address set isDefault = replace(isDefault,'1','0') where id = ${addressId}`,function(){
					 let updateSql = `update address set uid = ? , name = ? , tel = ? , county = ? ,province = ? , city = ? , addressDetail = ? , isDefault = ? , areaCode = ? where id = ${id}`;
					 connection.query(updateSql,[uId,name,tel,county,province,city,addressDetail,isDefault,areaCode],function(e,r){
						res.send({
							data:{
								code:200,
								success:true,
								 msg:'修改成功'
							}
							
						})
					 })
				 })
			}else{
				 let updateSql = `update address set uid = ? , name = ? , tel = ? , county = ? ,province = ? , city = ? , addressDetail = ? , isDefault = ? , areaCode = ? where id = ${id}`;
				 connection.query(updateSql,[uId,name,tel,county,province,city,addressDetail,isDefault,areaCode],function(e,r){
					res.send({
						data:{
							code:200,
							success:true,
							 msg:'修改成功'
						}
						
					})
				 })
			}
		})
	})
})

// 查询 收货地址
router.post('/api/selectAddAddress',function(req, res, next){
	// token
	let token=req.headers.token;
	let tokenObj=jwt.decode(token);
	connection.query(`select * from user where tel =${tokenObj.tel}`,function(error,results){
		// 当前用户
		let uId=results[0].id;
		connection.query(`select * from address where uid =${uId}`,function(err,result){
			res.send({
				data:{
					code:200,
					success:true,
					msg:'查询成功',
					data:result
				}
				
				 
			})
		})
	})
})
// 新增 收货地址
router.post('/api/addAddress',function(req, res, next){
	// console.log(req.body)
	
	// token
	let token=req.headers.token;
	let tokenObj=jwt.decode(token);
	
	let body=req.body;
	let [name,tel,county,province,city,addressDetail,isDefault,areaCode]=[
		body.name,
		body.tel,
		body.county,
		body.province,
		body.city,
		body.addressDetail,
		body.isDefault,
		 body.areaCode
	];
	// 查询用户
	connection.query(`select * from user where tel =${tokenObj.tel}`,function(error,results){
		// 当前用户
		let uId=results[0].id;
		// console.log(uId)
		//增加收货地址 考虑他是否要设置为默认地址
		if(isDefault!=1){
			connection.query(`insert into address (uId,name,tel,county,province,city,addressDetail,isDefault,areaCode) values (${uId},"${name}","${tel}","${county}","${province}","${city}","${addressDetail}","${isDefault}","${areaCode}")`,function(err,result){
				res.send({
					data:{
						code:200,
						success:true,
						 msg:'添加成功'
					}
					
				})
			})
		}else{
			 connection.query(`select * from address where uId = ${uId} and isDefault = ${isDefault}`,function(err,result){
				 if(result.length>0){
					 let addressId = result[0].id;
					 connection.query(`update address set isDefault = replace(isDefault,'1','0') where id = ${addressId}`,function(
					 ){
						 connection.query(`insert into address (uId,name,tel,county,province,city,addressDetail,isDefault,areaCode) values (${uId},"${name}","${tel}","${county}","${province}","${city}","${addressDetail}","${isDefault}","${areaCode}")`,function(e,r){
							res.send({
								data:{
									code:200,
									success:true,
									 msg:'添加成功'
								}
								
							})
						 })
					 })
				 }else{
					 connection.query(`insert into address (uId,name,tel,county,province,city,addressDetail,isDefault,areaCode) values (${uId},"${name}","${tel}","${county}","${province}","${city}","${addressDetail}","${isDefault}","${areaCode}")`,function(err,result){
					 	res.send({
					 		data:{
					 			code:200,
					 			success:true,
					 			 msg:'添加成功'
					 		}
					 		
					 	})
					 })
				 }
				 
			 })
		}
		
		
	})
	
})
// 修改购物车商品数量
router.post('/api/updateNum',function(req, res, next){
	let id=req.body.id;
	let changeNum=req.body.num;
	connection.query(`select * from goods_cart where id=${id}`,function(error,results){
		//原来的数量
		let num=results[0].goods_num;
		connection.query(`update goods_cart set goods_num=replace(goods_num,${num},${changeNum}) where id=${id}`,function(err,result){
			res.send({
				code:200,
				success:true
			})
		})
	})
})

// 删除 购物车数据
router.post('/api/deleteCart',function(req, res, next){
	let arrId=req.body.arrId;
	// console.log(id)
	for(let i=0;i<arrId.length;i++){
		connection.query(`delete from goods_cart where id=${arrId[i]}`,function(error,results){
			res.send({
				data:{
					code:200,
					success:true,
					msg:'删除成功',
				}
			})
		})
	}
	
})


// 查询购物车顺序
router.post('/api/selectCart',function(req, res, next){
	// token
	let token=req.headers.token;
	let tokenObj=jwt.decode(token);
	connection.query(`select * from user where tel =${tokenObj.tel}`,function(error,results){
		let uId=results[0].id;
		// 查询 一个独立用户的购物车商品
		connection.query(`select * from goods_cart where uId=${uId}`,function(err,result){
			res.send({
				data:{
					code:200,
					success:true,
					data:result
				}
				
			})
		})
	})
})
// 加入购物车
router.post('/api/addCart',function(req, res, next){
	// 后台接收前端参数
	let goodsId=req.body.goodsId;
	// token
	let token=req.headers.token;
	let tokenObj=jwt.decode(token);
	
	// 如果执行，证明token过期
	if(getTimeToken(tokenObj.exp)){
		res.send({
			data:{
				code:1000
			}
		})
	}
	// 查询用户id
	connection.query(`select * from user where tel =${tokenObj.tel}`,function(error,results){
		// 用户id
		let uId=results[0].id;
		// console.log(results[0])
		// 查询商品
		connection.query(`select * from goods_list where id =${goodsId}`,function(err,result){
			// console.log(result[0])
			let goodsName = result[0].name;
			let goodsPrice = result[0].price;
			let goodsImgUrl = result[0].imgUrl;
			
			// 查询当前用户购物车中是否已有该商品
			connection.query(`select * from goods_cart where uid =${uId} and goods_id=${goodsId}`,function(er,re){
				// 如果已有，商品数量+1
				if(re.length>0){
					let num=re[0].goods_num;
					connection.query(`update goods_cart set goods_num=replace(goods_num,${num},${parseInt(num)+1}) where id=${re[0].id}`,function(e,r){
						res.send({
							data:{
								code:200,
								success:true,
								msg:'添加成功'
							}
						})
					})
				}else{
					// 没有，添加该商品
					// console.log(`insert into goods_cart (uId,goods_id,goods_name,goods_price,goods_num,goods_imgUrl) values ("${uId}","${goodsId}","${goodsName}","${goodsPrice}","1","${goodsImgUrl}")`)
					connection.query(`insert into goods_cart (uId,goods_id,goods_name,goods_price,goods_num,goods_imgUrl) values ("${uId}","${goodsId}","${goodsName}","${goodsPrice}","1","${goodsImgUrl}")`,function(e,r){
						res.send({
							data:{
								code:200,
								success:true,
								msg:'添加成功'
							}
						})
					})
				}
			})
			
		})
	})
	
})
// 修改密码
router.post('/api/recovery',function(req, res, next){
	let params={
		userTel:req.body.phone,
		userPwd:req.body.pwd,
	}
	connection.query(user.queryUserTel(params),function(error,results){
		// 获取该条数据id
		let id=results[0].id
		let pwd=results[0].pwd
		// update user set pwd = replace(pwd,'${pwd}','${params.userPwd}')   将用户表user中所有密码字段pwd中包含旧密码 ${pwd} 的字符串替换为新密码 ${params.userPwd} 
		connection.query(`update user set pwd=${params.userPwd} where id = ${id}`,function(err,result){
			res.send({
				code:200,
				data:{
					success:true,
					msg:'密码修改成功'
				}
			})
		})
	})
})
// 判断输入的手机号是否已注册	
router.post('/api/selectUser',function(req, res, next){
	let params={
		userTel:req.body.phone,
		}
		// 查询用户 是否存在
		connection.query(user.queryUserTel(params),function(error,results){
			if(results.length>0){
				res.send({
					code:200,
					data:{
						success:true
					}
				})
			}else{
				res.send({
					code:0,
					data:{
						success:false,
						msg:'该账号未注册'
					}
				})
			}
		})
})
// 注册
router.post('/api/rejister',function(req, res, next){
	let params={
		userTel:req.body.phone,
		userPwd:req.body.pwd,
		}
		// 查询用户 是否存在
		connection.query(user.queryUserTel(params),function(error,results){
			if(error) throw error;
			if(results.length>0){
				res.send({
					code:200,
					data:{
						success:true,
						msg:'登陆成功',
						data:results[0]
					}
				})
			}else{
				// 不存在，增加一条用户数据
				connection.query(user.insertData(params),function(err,result){
					connection.query( user.queryUserTel( params ) , function(e,r){
						res.send({
							code:200,
							data:{
								success:true,
								msg:'登陆成功',
								data:r[0]
							}
						})
					})
				})
			}
		})
})

// 验证码登录,增加用户
router.post('/api/addUser',function(req, res, next){
	let params={userTel:req.body.phone}
	// 查询用户 是否存在
	connection.query(user.queryUserTel(params),function(error,results){
		if(error) throw error;
		if(results.length>0){
			res.send({
				code:200,
				data:{
					success:true,
					msg:'登陆成功',
					data:results[0]
				}
			})
		}else{
			// 不存在，增加一条用户数据
			connection.query(user.insertData(params),function(err,result){
				connection.query( user.queryUserTel( params ) , function(e,r){
					res.send({
						code:200,
						data:{
							success:true,
							msg:'登陆成功',
							data:r[0]
						}
					})
				})
			})
		}
	})
})
// 发送验证码
router.post('/api/code',function(req, res, next){
	let tel=req.body.phone;
	// 短信应用SDK AppID
	var appid = 1400187558;  // SDK AppID是1400开头
	
	// 短信应用SDK AppKey
	var appkey = "dc9dc3391896235ddc2325685047edc7";
	
	// 需要发送短信的手机号码
	var phoneNumbers = [tel];
	
	// 短信模板ID，需要在短信应用中申请
	var templateId = 285590;  // NOTE: 这里的模板ID`7839`只是一个示例，真实的模板ID需要在短信控制台中申请
	
	// 签名
	var smsSign = "三人行慕课";  // NOTE: 这里的签名只是示例，请使用真实的已申请的签名, 签名参数使用的是`签名内容`，而不是`签名ID`
	
	// 实例化QcloudSms
	var qcloudsms = QcloudSms(appid, appkey);
	
	// 设置请求回调处理, 这里只是演示，用户需要自定义相应处理回调
	function callback(err, ress, resData) {
	    if (err) {
	        console.log("err: ", err);
	    } else {
	        console.log("request data: ", ress.req);
	        console.log("response data: ", resData);
			res.send({
				code:200,
				data:{
					success:true,
					data:ress.req.body.params[0]
				}
			})
	    }
	}
	var ssender = qcloudsms.SmsSingleSender();
	//这个变量：params 就是往手机上，发送的短信
	var params = [  Math.floor( Math.random()*(9999-1000))+1000   ];
	ssender.sendWithParam(86, phoneNumbers[0], templateId,
	  params, smsSign, "", "", callback);  // 签名参数不能为空串
})

// 账号密码登录请求
router.post('/api/login',function(req, res, next){
	// 接受前端传过来的账号密码
	let params={
		userTel:req.body.userTel,
		userPwd:req.body.userPwd,
	}
	let userTel=params.userTel;
	let userPwd = params.userPwd  || '666666';
	
	// 引入 token 包
	let jwt = require('jsonwebtoken');
	//用户信息
	let payload={tel:userTel};
	// 口令
	let secret='gxy'
	// 生成token
	let token =jwt.sign(payload,secret,{
		expiresIn:60
	})
	
	// 查寻手机号是否存在
	connection.query(user.queryUserTel(params),function(error,results){
		
		if(results.length>0){		// 存在
			let id=results[0].id;
			connection.query(user.queryUserPwd(params),function(err,result){
				if(result.length>0){
					
					connection.query(`update user set token='${token}' where id=${id}`,function(){
						res.send({
							code:200,
							data:{
								success:true,
								msg:'登陆成功',
								data:result[0]
							}
						})
					})
					
					
				}else{	//密码不对
					res.send({
						code:302,
						data:{
							success:false,
							msg:'密码错误'
						}
					})
				}
			})
		}else{
			res.send({
				code:301,
				data:{
					success:false,
					msg:'该账号未注册'
				}
			})
		}
	})
})

// 查询商品 数据接口
 router.get('/api/goods/shopList',function(req, res, next){
	 // 前端给后端的数据（输入框输入的内容）
	 let [searchName,orderName] = Object.keys(req.query);
		let [name,order] = Object.values(req.query);
	 console.log(searchName,orderName,name,order)
		connection.query('select * from goods_list where name like "%'+name+'%" order by '+orderName+' '+order+'',function(error,results){
			 res.send({
				 code:0,
				 data:results
			 })
		 })
	 
 })


// 首页 大红袍
router.get('/api/index_list/1/data/1', function(req, res, next) {
  res.send({
	  code:0,
	  data:[
		  {
			  id:1,
			  type:'adList',
			  data:[
				  {
					  id:1,
					  imgUrl:'./images/ad1.jpg'
				  },
				  // {
					 //  id:2,
					 //  imgUrl:'./images/ad2.jpg'
				  // }
			  ]
		  },
		  // 猜你喜欢
		  {
			  id:2,
			  type:'likeList',
			  data:[
				  {
					id:1,
					name:'大耳朵图图，动耳神功-大耳朵图图，动耳神功',
					price:'100',
					imgUrl:'./images/swiper1.jpg'
					
				  },
				  {
					id:2,
					name:'水果干脆 果脯草莓',
					price:'8.9',
					imgUrl:'./images/recommend1.jpg'
					
				  },
				  {
					id:3,
					name:'水果干脆 果脯草莓',
					price:'8.9',
					imgUrl:'./images/recommend1.jpg'
					
				  },
			  ]
		  }
		  
	  ]
  });
});

// 铁观音
router.get('/api/index_list/2/data/1', function(req, res, next) {
  res.send({
	  code:0,
	  data:[
		  {
			  id:1,
			  type:'adList',
			  data:[
				  // {
					 //  id:1,
					 //  imgUrl:'./images/ad1.jpg'
				  // },
				  {
					  id:1,
					  imgUrl:'./images/ad2.png'
				  }
			  ]
		  },
		  // 热烈推荐
		  {
		  				  id:2,
		  				  type:'recommendList',
		  				  data:[
		  					  {
		  					  	id:1,
		  					  	name:'龙井1号200g',
		  					  	content:'正宗龙井，鲜爽甘醇',
		  					  	price:'100',
		  					  	imgUrl:'./images/recommend.jpeg'
		  					  	
		  					  },
		  					  {
		  					  	id:2,
		  					  	name:'冻干草莓200g',
		  					  	content:'水果干脆 果脯草莓',
		  					  	price:'8.9',
		  					  	imgUrl:'./images/recommend1.jpg'
		  					  	
		  					  },
		  				  ]
		  },
		  // 猜你喜欢
		  {
			  id:3,
			  type:'likeList',
			  data:[
				  {
					id:1,
					name:'大耳朵图图，动耳神功-大耳朵图图，动耳神功',
					price:'100',
					imgUrl:'./images/swiper1.jpg'
					
				  },
				  {
					id:2,
					name:'水果干脆 果脯草莓',
					price:'8.9',
					imgUrl:'./images/recommend1.jpg'
					
				  },
				  {
					id:3,
					name:'水果干脆 果脯草莓',
					price:'8.9',
					imgUrl:'./images/recommend1.jpg'
					
				  },
			  ]
		  }
		  
	  ]
  });
});

// 首页推荐
router.get('/api/index_list/0/data/1', function(req, res, next) {
  res.send({
	  code:0,
	  data:{
		  topBar:[
		  				{id:0,label:'推荐'},
		  				{id:1,label:'大红袍'},
		  				{id:2,label:'铁观音'},
		  				{id:3,label:'绿茶'},
		  				{id:4,label:'普洱'},
		  				{id:5,label:'茶具'},
		  				{id:6,label:'花茶'},
		  			],
		  data:[
			  // swiper
			  {
				  id:0,
				  type:'swiperList',
				  data:[
					  {
						  id:0,imgUrl:'./images/swiper1.jpg'},
					  {
					  	id:1,
					  	imgUrl:'./images/swiper2.jpg'
					  },
					  {
					  	id:2,
					  	imgUrl:'./images/swiper3.jpg'
					  }
				  ]
			  },
			  // icons
			  {
				  id:1,
				  type:'iconsList',
				  data:[
					  {
					  	id:1,
					  	title:'自饮茶',
					  	imgUrl:'./images/icons1.png'
					  },
					  {
					  	id:2,
					  	title:'茶具',
					  	imgUrl:'./images/icons2.png'
					  },
					  {
					  	id:3,
					  	title:'茶礼盒',
					  	imgUrl:'./images/icons3.png'
					  },
					  {
					  	id:4,
					  	title:'领福利',
					  	imgUrl:'./images/icons4.png'
					  },
					  {
					  	id:5,
					  	title:'官方验证',
					  	imgUrl:'./images/icons5.png'
					  },
				  ]
			  },
			  // 热烈推荐
			  {
				  id:3,
				  type:'recommendList',
				  data:[
					  {
					  	id:1,
					  	name:'龙井1号200g',
					  	content:'正宗龙井，鲜爽甘醇',
					  	price:'100',
					  	imgUrl:'./images/recommend.jpeg'
					  	
					  },
					  {
					  	id:2,
					  	name:'冻干草莓200g',
					  	content:'水果干脆 果脯草莓',
					  	price:'8.9',
					  	imgUrl:'./images/recommend1.jpg'
					  	
					  },
				  ]
			  },
			  // 猜你喜欢
			  {
				  id:4,
				  type:'likeList',
				  data:[
					  {
					  	id:1,
					  	name:'音朗茶叶绿茶2023新茶 龙井茶300g 明前特级龙井春茶杭州豆香型礼盒装',
					  	price:'180',
					  	imgUrl:'./images/goods1.jpg'
					  	
					  },
					  {
					  	id:2,
					  	name:'醉然香 茶叶 新会小青柑普洱茶正宗生晒陈皮普洱熟茶茶叶500g',
					  	price:'89',
					  	imgUrl:'./images/goods2.jpg'
					  	
					  },
					  {
					  	id:3,
					  	name:'一杯香茶叶茉莉花茶特级花草茶新茶礼盒装散装2罐共500g浓香型茗茶',
					  	price:'128',
					  	imgUrl:'./images/goods3.jpg'
					  	
					  },
					  {
					  	id:4,
					  	name:'中谷御品 雀舌茶叶绿茶 2023新茶特级明前头采贵州湄潭翠芽茶叶礼盒300g',
					  	price:'178',
					  	imgUrl:'./images/goods4.jpg'
					  	
					  },
					  {
					  	id:5,
					  	name:'第一江南茶叶 2023新茶明前绿茶特级龙井杭州龙井一帘春色茶叶礼盒250g',
					  	price:'538',
					  	imgUrl:'./images/goods5.jpg'
					  	
					  },
					  {
					  	id:6,
					  	name:'水果干脆 果脯草莓',
					  	price:'8.9',
					  	imgUrl:'./images/recommend1.jpg'
					  	
					  },
					  {
					  	id:7,
					  	name:'大耳朵图图，动耳神功-大耳朵图图，动耳神功',
					  	price:'100',
					  	imgUrl:'./images/swiper1.jpg'
					  	
					  },
					  {
					  	id:8,
					  	name:'水果干脆 果脯草莓',
					  	price:'8.9',
					  	imgUrl:'./images/recommend1.jpg'
					  	
					  },
					  {
					  	id:9,
					  	name:'水果干脆 果脯草莓',
					  	price:'8.9',
					  	imgUrl:'./images/recommend1.jpg'
					  	
					  },
					  {
					  	id:10,
					  	name:'大耳朵图图，动耳神功-大耳朵图图，动耳神功',
					  	price:'100',
					  	imgUrl:'./images/swiper1.jpg'
					  	
					  },
					  {
					  	id:11,
					  	name:'水果干脆 果脯草莓',
					  	price:'8.9',
					  	imgUrl:'./images/goods2.jpg'
					  	
					  },
					  {
					  	id:12,
					  	name:'水果干脆 果脯草莓',
					  	price:'8.9',
					  	imgUrl:'./images/goods1.jpg'
					  	
					  },
				  ]
			  }
		  ]
	  }
  });
});

// 分类页面
// 分类的接口
router.get('/api/goods/list',function(req,res,next){
	res.send({
		code:0,
		data:[
			{
				// 一级
				id:0,
				name:"推荐",
				data:[
					{
						// 二级
						id:0,
						name:"推荐",
						list:[
							// 三级
							{
								id:0,
								name:"青竹",
								imgUrl:'./images/list1.jpg',
							},
							{
								id:1,
								name:"茶壶",
								imgUrl:'./images/list1.jpg',
							},
							{
								id:2,
								name:"杯子",
								imgUrl:'./images/list1.jpg',
							},
							{
								id:3,
								name:"足迹",
								imgUrl:'./images/list1.jpg',
							},
							{
								id:4,
								name:"绿叶",
								imgUrl:'./images/list1.jpg',
							},
							{
								id:5,
								name:"青竹",
								imgUrl:'./images/list1.jpg',
							},
						]
					}
				]
			},
			{
				// 一级
				id:1,
				name:"绿茶",
				data:[
					{
						// 二级
						id:0,
						name:"绿茶",
						list:[
							// 三级
							{
								id:0,
								name:"绿",
								imgUrl:'./images/list1.jpg',
							},
							{
								id:1,
								name:"茶壶",
								imgUrl:'./images/list2.jpg',
							},
							{
								id:2,
								name:"杯子",
								imgUrl:'./images/list2.jpg',
							},
							{
								id:3,
								name:"足迹",
								imgUrl:'./images/list1.jpg',
							},
							{
								id:4,
								name:"绿叶",
								imgUrl:'./images/list1.jpg',
							},
							{
								id:5,
								name:"青竹",
								imgUrl:'./images/list1.jpg',
							},
						]
					}
				]
			},
			{
				// 一级
				id:2,
				name:"红茶",
				data:[
					{
						// 二级
						id:0,
						name:"红茶",
						list:[
							// 三级
							{
								id:0,
								name:"红",
								imgUrl:'./images/list3.jpg',
							},
							{
								id:1,
								name:"茶",
								imgUrl:'./images/list3.jpg',
							},
							{
								id:2,
								name:"杯",
								imgUrl:'./images/list2.jpg',
							},
							{
								id:3,
								name:"足迹",
								imgUrl:'./images/list1.jpg',
							},
							{
								id:4,
								name:"绿叶",
								imgUrl:'./images/list1.jpg',
							},
							{
								id:5,
								name:"青竹",
								imgUrl:'./images/list3.jpg',
							},
						]
					}
				]
			},
			{
				// 一级
				id:3,
				name:"果茶",
				data:[
					{
						// 二级
						id:0,
						name:"果茶",
						list:[
							// 三级
							{
								id:0,
								name:"果",
								imgUrl:'./images/list3.jpg',
							},
							{
								id:1,
								name:"茶",
								imgUrl:'./images/list4.jpg',
							},
							{
								id:2,
								name:"苹果",
								imgUrl:'./images/list3.jpg',
							},
							{
								id:3,
								name:"足迹",
								imgUrl:'./images/list1.jpg',
							},
							{
								id:4,
								name:"绿叶",
								imgUrl:'./images/list1.jpg',
							},
							{
								id:5,
								name:"青竹",
								imgUrl:'./images/list4.jpg',
							},
						]
					}
				]
			},
			{
				// 一级
				id:4,
				name:"花茶",
				data:[
					{
						// 二级
						id:0,
						name:"花茶",
						list:[
							// 三级
							{
								id:0,
								name:"花",
								imgUrl:'./images/list4.jpg',
							},
							{
								id:1,
								name:"茶壶",
								imgUrl:'./images/list2.jpg',
							},
							{
								id:2,
								name:"茉莉",
								imgUrl:'./images/list2.jpg',
							},
							{
								id:3,
								name:"青梅",
								imgUrl:'./images/list4.jpg',
							},
							{
								id:4,
								name:"绿叶",
								imgUrl:'./images/list1.jpg',
							},
							{
								id:5,
								name:"青竹",
								imgUrl:'./images/list1.jpg',
							},
						]
					}
				]
			},
			{
				//一级
				id:5,
				name:'普洱',
				data:[
					{
						//二级
						id:0,
						name:'普洱',
						list:[
						//三级
							{
								id:0,
								name:'龙井',
								imgUrl:'./images/list2.jpg'
							},
							{
								id:1,
								name:'碧螺春',
								imgUrl:'./images/list1.jpg'
							},
							{
								id:3,
								name:'雀舌',
								imgUrl:'./images/list2.jpg'
							},
							{
								id:4,
								name:'安吉白茶',
								imgUrl:'./images/list3.jpg'
							},
							{
								id:5,
								name:'六安瓜片',
								imgUrl:'./images/list1.jpg'
							}
						]
					}
				]
			}
			
		]
	})
})

// 购买页面
// 查询首页 猜你喜欢 里的商品id
router.get('/api/goods/id',function(req,res,next){
	let id = req.query.id;
	connection.query(`select * from goods_list where id=${id}`,function(error,results,fields){
		if( error ) throw error;
		res.json({
			code:0,
			data:results[0]
		})
	});

})
module.exports = router;

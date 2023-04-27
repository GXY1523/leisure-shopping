//验证 数据库中的用户的相关行为
const User={
	// 查询手机号
	queryUserTel(option){
		return 'SELECT * FROM USER WHERE tel='+option.userTel+'';
	},
	// 查询密码
	queryUserPwd(option){
		return 'SELECT * FROM USER WHERE (tel = '+option.userTel+') and pwd = '+option.userPwd+'';
	},
	// 增加用户
	insertData(option){
		let userTel=option.userTel;
		let userPwd = option.userPwd  || '666666';
		
		// 引入 token 包
		let jwt = require('jsonwebtoken');
		//用户信息
		let payload={tel:userTel};
		// 口令
		let secret='gxy'
		// 生成token
		let token =jwt.sign(payload,secret,{
			//设置过期时间 60s
			expiresIn:60
		})
		
		return 'insert into user (tel,pwd,imgUrl,nickName,token) values ("'+userTel+'","'+userPwd+'","/images/pic1.png","'+userTel+'","'+token+'")';
	}
}

exports = module.exports = User;
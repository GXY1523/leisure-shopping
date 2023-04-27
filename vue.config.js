

let path = require("path");
module.exports = {
	publicPath:'./',
	lintOnSave:false,
	//代理
	
	devServer: {
		host:'192.168.54.95',
	  proxy: {
	    '/api': {
	      target: "http://localhost:3000",
	      changeOrigin: true,
	      pathRewrite: {
	        '^/api': '/api'
	      }
	    }
	  },
	},
	configureWebpack: (config) => {
    	config.resolve = { 
      		extensions: ['.js', '.json', '.vue'],
      		alias: {
	// @ 代表 ./src 这一部分路径
       	 		'@': path.resolve(__dirname, './src'),
      		}
    	}
  	}
}
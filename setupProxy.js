const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app){
    app.use(
        createProxyMiddleware(
            '/api',{
                target: 'http://127.0.0.1:8080',
                changeOrigin: true,
                // pathRewrite: {
                //     '^/api': '' // 移除掉以 /api 开头的路径前缀
                // },
                ws:true,
                logLevel:'debug'
            }
        )
    )
}

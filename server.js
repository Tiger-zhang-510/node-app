/**
 * 建立本地服务器
 */
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const passport = require('passport');

const app = express();

const users = require('./routes/api/users');
const profile = require('./routes/api/profile');
const posts = require('./routes/api/posts');

//DB config
const db = require('./config/keys').mongoURI;

//使用body-parser中间件(在post请求时需要使用中间件)
app.use(bodyParser.urlencoded({ extended: false }));//处理utf-8编码格式数据
app.use(bodyParser.json());//处理json数据

//连接数据库
mongoose.connect(db)
    .then( () => console.log("MongoDB Connected"))
    .catch(err => console.log(err));

//使用中间件允许跨域
app.use((req,res,next)=>{
    res.header("Access-Control-Allow-Origin","*");
    res.header("Access-Control-Allow-Headers","Content-Type");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    next();
});

//passport的初始化
app.use(passport.initialize());
require("./config/passport")(passport);

//设置路由
// app.get("/",(req,res)=>{
//     res.send("hello world 你好啊")
// });
//使用routes
app.use("/api/users",users);
app.use("/api/profile",profile);
app.use("/api/posts",posts);


const port = process.env.PORT || 5000;
app.listen(port,()=>{
    console.log(`Server running on port ${port}`);
});
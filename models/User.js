/**
 * 存储数据
 */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//创建schema
const UserSchema = new Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    avatar:{
        type:String,
    },
    data:{
        type:String,
        default:Date.now
    }
});
module.exports = User = mongoose.model("users",UserSchema);
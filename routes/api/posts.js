/**
 * 获取当前用户点赞评论内容
 */
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");

const Post = require("../../models/Post");
const Profile = require("../../models/Profiles");

const validatePostInput = require("../../validation/post")

// $route  GET api/posts/test
// @desc   返回的请求的json数据
// @access public
router.get("/test",(req,res) => {
    res.json({msg:"posts works"})
});
// $route  GET api/posts
// @desc   创建一个评论接口
// @access private
router.post("/",passport.authenticate('jwt', { session: false }),(req,res) => {

    const {errors,isValid} = validatePostInput(req.body);

    //判断isValid是否通过
    if(!isValid){
        return res.status(400).json(errors);
    }
    const newPost = new Post({
        text:req.body.text,
        name:req.body.name,
        avatar:req.body.avatar,
        user:req.user.id
    });

    newPost.save().then(post => res.json(post));
});

// $route  GET api/posts
// @desc   获取评论信息
// @access public
router.get("/",(req,res) => {
    Post.find()
        .sort({data:-1})//sort() 方法可以通过参数指定排序的字段，并使用 1 和 -1 来指定排序的方式，其中 1 为升序排列，而 -1 是用于降序排列
        .then(posts=>res.json(posts))
        .catch(err =>res.status(404).json({nopostsfound:"找不到任何评论信息"}))
});

// $route  GET api/posts/:id
// @desc   获取单个评论信息
// @access public
router.get("/:id",(req,res) => {
    Post.findById(req.params.id)
        .then(post =>res.json(post))
        .catch(err =>res.status(404).json({nopostfound:"找不到该评论信息"}))
});

// $route  DELETE api/posts/:id
// @desc  删除单个评论信息
// @access private
router.delete("/:id",passport.authenticate('jwt', { session: false }),(req,res) => {
    Profile.findOne({user:req.user.id}).then(profile =>{
        Post.findById(req.params.id)
            .then(post =>{
                //判断是否是本人
                if(post.user.toString() !==req.user.id){
                    return res.status(401).json({notauthorized:"用户非法操作"})
                }
                post.remove().then(() => res.json({success:true}))
            }).catch(err =>res.status(404).json({postnotfound:"没有找到该评论"}))
    })
});

// $route  POST api/posts/like/:id
// @desc  添加点赞接口
// @access private
router.post("/like/:id",passport.authenticate('jwt', { session: false }),(req,res) => {
    Profile.findOne({user: req.user.id}).then(profile => {
        Post.findById(req.params.id)
            .then(post => {
                //判断是否已经点赞过
                if (post.likes.filter(like => like.user.toString() === req.user.id).length > 0) {
                    return res.status(400).json({alreadylike: "用户已经点赞过了"})
                }
                post.likes.unshift({user: req.user.id})//添加到likes里面去

                post.save().then(() => res.json(post))//保存

            }).catch(err => res.status(404).json({likederror: "点赞错误"}))
    })
});

// $route  POST api/posts/unlike/:id
// @desc  取消点赞接口
// @access private
router.post("/unlike/:id",passport.authenticate('jwt', { session: false }),(req,res) => {
    Profile.findOne({user: req.user.id}).then(profile => {
        Post.findById(req.params.id)
            .then(post => {
                //判断用户是否已经点赞
                if (post.likes.filter(like => like.user.toString() === req.user.id).length === 0) {
                    return res.status(400).json({alreadylike: "用户没有点过赞"})
                }
                //获取要删除的user_id
                const removeIndex = post.likes.map(item => item.user.toString()).indexOf(req.user.id);

                post.likes.splice(removeIndex,1);//删除用户点赞

                post.save().then(post =>res.json(post))

            }).catch(err => res.status(404).json({likederror: "取消点赞错误"}))
    })
});

//$router POST api/posts/comment/:id
//@desc   添加评论接口
//@access private
router.post("/comment/:id",passport.authenticate('jwt', { session: false }),(req,res)=>{
    const {errors,isValid} = validatePostInput(req.body);
    //判断isValid是否通过
    if(!isValid){
        return res.status(400).json(errors);
    }
    Post.findById(req.params.id)
        .then(post =>{
            const newComment = {
                text:req.body.text,
                name:req.body.name,
                avatar:req.body.avatar,
                user:req.user.id
            };

            post.comments.unshift(newComment);
            //save
            post.save().then(post=>res.json(post))
        }).catch(err =>res.status(404).json({postnotfound:"添加评论错误"}))

});

//$router DELETE api/posts/comment/:id
//@desc   删除评论接口
//@access private
router.delete("/comment/:id/:comment_id",passport.authenticate('jwt', { session: false }),(req,res)=>{

    Post.findById(req.params.id)
        .then(post =>{
            if(post.comments.filter(comment => comment._id.toString() === req.params.comment_id).length === 0){
                return res.status(404).json({commentnotexists:"该评论不存在"})
            }
            //找到评论的index
            const removeIndex = post.comments.map(item => item._id.toString()).indexOf(req.params.comment_id)

            post.comments.splice(removeIndex,1);

            post.save().then(post => res.json(post))

        }).catch(err =>res.status(404).json({postnotfound:"删除评论错误"}))

});


module.exports = router
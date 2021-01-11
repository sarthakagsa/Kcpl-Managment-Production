const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')

router.get('/login',(req,res)=>{
    res.render('login')
})

router.get('/signup',(req,res)=>{
    res.render('signup')
})

router.get('/home/:token',auth,(req,res)=>{
    res.render('home',{user:req.user,token: req.token})
})

module.exports = router
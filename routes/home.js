const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')

router.get('/login',(req,res)=>{
    res.render('login')
})

// router.get('/signup',(req,res)=>{
//     res.render('signup')
// })

router.get('/home/:token',auth,(req,res)=>{
    res.render('home',{user:req.user,token: req.token})
})

router.get('/lr/me/:token',auth,(req,res)=>{
    res.render('lr/lr',{user:req.user,token: req.token})
})

router.get('/downloadlr',(req,res)=>{
    res.download('lr.xlsx')
})



module.exports = router
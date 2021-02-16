const auth = require('../../middleware/auth')
const express = require('express')
const router = new express.Router()

router.get('/lr/singlepartylr/:token',auth,async(req,res)=>{
    res.render('lr/singlePartyLr/singlepartylr',{token : req.token,user : req.user})
})

router.get('/lr/multiplepartylr/:token',auth,async(req,res)=>{
    res.render('lr/multiplePartyLr/multiplepartylr',{token : req.token,user : req.user})
})

module.exports = router
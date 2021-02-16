const auth = require('../../middleware/auth')
const express = require('express')
const router = new express.Router()

router.get('/warehouse/:token',auth,async(req,res)=>{
    res.render('warehouse/warehouse',{token : req.token,user : req.user})
})


module.exports = router
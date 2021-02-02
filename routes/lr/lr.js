const auth = require('../../middleware/auth')
const express = require('express')
const router = new express.Router()
const User = require('../../models/user')
const Vechile = require('../../models/vechile')
const Lr = require('../../models/llr')
const Consignor = require('../../models/consignor')
const ExcelJs = require('exceljs')

router.get('/lr/singlepartylr/:token',auth,async(req,res)=>{
    res.render('lr/singlePartyLr/singlepartylr',{token : req.token,user : req.user})
})

router.get('/lr/multiplepartylr/:token',auth,async(req,res)=>{
    res.render('lr/multiplePartyLr/multiplepartylr',{token : req.token,user : req.user})
})

module.exports = router
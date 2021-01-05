const auth = require('../middleware/auth')
const express = require('express')
const router = new express.Router()
const User = require('../models/user')
const Vechile = require('../models/vechile')
const Repair = require('../models/repair')

router.post('/repair/:id',auth,async(req,res)=>{
    const _id = req.params.id
    console.log(_id);
    try {
        const repair = new Repair({
            ...req.body,
            vechileid : _id
        })
        const newRepair = await vechile.save()
        res.status(201).send(newRepair)
    }
    catch (e) {
        console.log(e);
        res.status(400).send(e.message)
    }
})



module.exports = router
const express = require('express')
const auth = require('../middleware/auth')
const router = new express.Router()
const Consignor = require('../models/consignor')

router.post('/consignor/:token',auth,async(req,res)=>{
    try {
        const consignor = new Consignor({
            ...req.body,
            owner : req.user._id
        })
        const newConsignor = await consignor.save()
        res.status(201).send({token:req.token,consignor : newConsignor})
    }
    catch (e) {
        console.log(e);
        res.status(400).send(e)
    } 
})

router.get('/consignors/:id/:token',auth,async(req,res)=>{
    const _id = req.params.id
    try {
    //    const task = await Task.findById(_id)

       const consignor = await Consignor.findOne({ _id , owner : req.user._id})
       if(!consignor){
        return res.status(404).send({error:'No consignee Found'})
        }
    res.render("consignor/Singleconsignor.ejs",{consignor : consignor,user : req.user,token:req.token})
    } catch (e) {
        res.status(500).send(e)   
    }
})

router.get('/consignor/me/:token',auth,async(req,res)=>{
    try {
        const consignor = await Consignor.find({owner : req.user._id})
        res.render("consignor/Allconsignors.ejs",{consignor : consignor,user : req.user,token:req.token})
    } catch (error) {
        res.send(400).error(error)
    }
})

router.patch('/consignor/:id/:token',auth,async(req,res)=>{
    const updates = Object.keys(req.body)
    const allowedUpdates =['consignorname','address']
    const isValidOperation = updates.every((update)=> allowedUpdates.includes(update))
    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid Updates!'})       
    }
    try {
        const consignor = await Consignor.findOne({_id:req.params.id,owner : req.user._id})
        
        
        //const task = await Task.findByIdAndUpdate(req.params.id,req.body,{new : true, runValidators : true})
        if (!consignor) {
            return res.status(404).send({error : "Consignor is not found"})
        }
        updates.every((update)=> consignor[update] = req.body[update] )

        await consignor.save()
        res.send({consignor : consignor,user : req.user,token:req.token})
    } catch (e) {
        return res.status(404).send(e)
    }
})

router.delete('/consignor/:id/:token',auth,async(req,res)=>{
    try {
        const consignor = await Consignor.findOne({_id:req.params.id,owner:req.user._id})
        if (!consignor) {
            return res.status(400).send({error : 'No consignee exist with this user'})
        }
        await consignor.remove()
        res.send({token : req.token})
    } catch (e) {
        res.status(400).send(e.message)
    }
})

module.exports = router
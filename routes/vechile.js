const express = require('express')
const auth = require('../middleware/auth')
const Vechile = require('../models/vechile')
const router = new express.Router()
const addVechileSchema = require('../middleware/Joi-Schemas/Vechile')

router.post('/vechile',auth,async(req,res)=>{
    try {
        await addVechileSchema.validateAsync(req.body)
        const vechile = new Vechile({
            ...req.body,
            owner : req.user._id
        })
        const newVechile = await vechile.save()
        res.status(201).send(newVechile)
    }
    catch (e) {
        res.status(400).send(e)
    } 
})

router.get('/vechiles/:id',auth,async(req,res)=>{
    const _id = req.params.id
    try {
    //    const task = await Task.findById(_id)

       const vechile = await Vechile.findOne({ _id , owner : req.user._id})
       if(!vechile){
        return res.status(404).send({error:'No vechile Found'})
        }
    res.send(vechile)
    } catch (e) {
        res.status(500).send()   
    }
})

router.get('/vechile/me',auth,async(req,res)=>{
    try {
        const vechile = await Vechile.find({owner : req.user._id})
        res.send(vechile)
    } catch (error) {
        res.send(400).error(error)
    }
})

router.patch('/vechile/:id',auth,async(req,res)=>{
    const updates = Object.keys(req.body)
    const allowedUpdates =['vechileno']
    const isValidOperation = updates.every((update)=> allowedUpdates.includes(update))
    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid Updates!'})       
    }
    try {
        await addVechileSchema.validateAsync(req.body)
        const vechile = await Vechile.findOne({_id:req.params.id,owner : req.user._id})
        
        
        //const task = await Task.findByIdAndUpdate(req.params.id,req.body,{new : true, runValidators : true})
        if (!vechile) {
            return res.status(404).send({error : "Vechile is not found"})
        }
        updates.every((update)=> vechile[update] = req.body[update] )

        await vechile.save()
        res.send(vechile)
    } catch (e) {
        return res.status(404).send(e)
    }
})

router.delete('/tasks/:id',auth,async(req,res)=>{
    try {
        const vechile = await Vechile.findOneAndDelete({_id:req.params.id,owner:req.user._id})

        if (!vechile) {
            return res.status(400).send({error : 'No vechile exist'})
        }
        res.send(vechile)
    } catch (e) {
        res.status(400).send(e)
    }
})

module.exports = router
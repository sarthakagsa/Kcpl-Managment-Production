const express = require('express')
const auth = require('../middleware/auth')
const Vechile = require('../models/vechile')
const router = new express.Router()
const addVechileSchema = require('../middleware/Joi-Schemas/Vechile')
const Repair = require('../models/repair')
const Tire = require('../models/tire')

router.post('/vechile/:token',auth,async(req,res)=>{
    try {
        await addVechileSchema.validateAsync(req.body)
        const vechile = new Vechile({
            ...req.body,
            owner : req.user._id
        })
        const newVechile = await vechile.save()
        res.send({token:req.token,vechile : newVechile})
    }
    catch (e) {
        res.status(400).send(e)
    } 
})

router.get('/vechiles/:id/:token',auth,async(req,res)=>{
    const _id = req.params.id
    try {
    //    const task = await Task.findById(_id)

       const vechile = await Vechile.findOne({ _id , owner : req.user._id})
       if(!vechile){
        return res.status(404).send({error:'No vechile Found'})
        }
        res.render("vechile/SingleVechile.ejs",{vechile : vechile,user : req.user,token:req.token})
    } catch (e) {
        res.status(500).send()   
    }
})

router.get('/vechile/me/:token',auth,async(req,res)=>{
    try {
        const vechile = await Vechile.find({owner : req.user._id})
        res.render("vechile/Allvechiles.ejs",{vechile : vechile,user : req.user,token:req.token})
    } catch (error) {
        res.status(400).send(error)
    }
})

router.get('/vechile/me/chart/:token',auth,async(req,res)=>{
    try {
        let totalrepair = 0
        let totalcost = 0
        const repairs = []
        const vechile = await Vechile.find({owner : req.user._id})
        vechile.forEach(async(vechile) => {
            const repair = await Repair.find({vechileid : vechile._id})
            repair.forEach(repair => {
                repairs.push(repair)
                totalcost = totalcost + repair.cost
            });
        });
        await Repair.find()
        totalrepair = repairs.length
        res.send({vechile : vechile,user : req.user,token:req.token,totalrepair : totalrepair,totalcost : totalcost})
    } catch (error) {
        res.status(400).send(error)
    }
})

router.patch('/vechile/:id/:token',auth,async(req,res)=>{
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

        const updatedvechile =await vechile.save()
        res.send({vechile : updatedvechile,user : req.user,token:req.token})
    } catch (e) {
        return res.status(404).send(e)
    }
})

router.delete('/vechile/:id/:token',auth,async(req,res)=>{
    try {
        const vechile = await Vechile.findOne({_id:req.params.id,owner:req.user._id})
        if (!vechile) {
            return res.status(400).send({error : 'No vechile exist with this user'})
        }
        await vechile.remove()
        res.send({token:req.token})
    } catch (e) {
        res.status(400).send(e.message)
    }
})

router.get('/vechiles/repair/:id/:token',auth,async (req,res)=>{
    const vechileid = req.params.id
    const vechile = await Vechile.findOne({_id : vechileid,owner : req.user._id})
        if (!vechile) {
            return res.status(400).send({error : 'The vechile is not associated with this user'})
        }
    const repair = await Repair.find({vechileid : vechileid})
    if (!repair) {
        return res.render("repair/Allvrepair.ejs",{error : 'NO repairs found'})
    }
    let totalcost = 0
    repair.forEach(repair => {
        totalcost = totalcost + repair.cost
    });
    totalcost = Math.round(totalcost)
    res.render("repair/Allrepair.ejs",{vechile : vechile,user : req.user,token:req.token,repair:repair,totalcost : totalcost})
})

router.get('/vechiles/tire/:id/:token',auth,async (req,res)=>{
    const vechileid = req.params.id
    const vechile = await Vechile.findOne({_id : vechileid,owner : req.user._id})
        if (!vechile) {
            return res.status(400).send({error : 'The vechile is not associated with this user'})
        }
    const tire = await Tire.find({vechileid : vechileid})
    if (!tire) {
        return res.render("tire/Alltire.ejs",{error : 'NO repairs found'})
    }
    let totalcost = 0
    tire.forEach(tire => {
        totalcost = totalcost + tire.cost
    });
    totalcost = Math.round(totalcost)
    res.render("tire/Alltire.ejs",{vechile : vechile,user : req.user,token:req.token,tire:tire,totalcost : totalcost})
})

module.exports = router
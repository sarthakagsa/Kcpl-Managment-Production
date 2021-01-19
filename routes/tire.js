const auth = require('../middleware/auth')
const express = require('express')
const router = new express.Router()
const User = require('../models/user')
const Vechile = require('../models/vechile')
const Tire = require('../models/tire')

router.post('/tire/:id/:token',auth,async(req,res)=>{
    const vechile_id = req.params.id
    try {
        const vechile = await Vechile.findOne({_id : vechile_id,owner : req.user._id})
        if (!vechile) {
            return res.status(400).send({error : 'The vechile is not associated with this user'})
        }
        const tire = new Tire({
            ...req.body,
            vechileid : vechile_id
        })
        const newTire = await tire.save()
        res.status(201).send({tire : newTire,token:req.token,vechile : vechile})
    }
    catch (e) {
        console.log(e);
        res.status(400).send(e.message)
    }
})

router.patch('/tire/:vechileid/:tireid/:token',auth,async(req,res)=>{
    const updates = Object.keys(req.body)
    const allowedUpdates =['parts','date','cost','invoice','partyname','km','gst']
    const isValidOperation = updates.every((update)=> allowedUpdates.includes(update))
    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid Updates!'})       
    }
    req.body.parts.forEach(element => {
        const partsUpdates = Object.keys(element)
        const partsAllowedUpdates = ['partname','cost','quantity','hsn','partnumber']
        const isValidOperation = partsUpdates.every((update)=>partsAllowedUpdates.includes(update))
        if (!isValidOperation) {
            return res.status(400).send({ error: 'Invalid Updates!'})       
        }
    })
    try {
        const vechile = await Vechile.findOne({_id:req.params.vechileid,owner : req.user._id})
        //const task = await Task.findByIdAndUpdate(req.params.id,req.body,{new : true, runValidators : true})
        if (!vechile) {
            return res.status(404).send({error : "Vechile is not found"})
        }
        const tire = await Tire.findOne({_id: req.params.tireid,vechileid:req.params.vechileid})
        if (!tire) {
            return res.status(404).send({error : "Tthe following docs is not found"})
        }
        updates.every((update)=> tire[update] = req.body[update] )
        await tire.save()
        res.send({tire : tire, token : req.token, vechileid : req.params.vechileid})
    } catch (e) {
        return res.status(404).send(e)
    }
})

router.get('/tire/:vechileid/:tireid/:token',auth,async (req,res)=>{
    try {
        const vechile = await Vechile.findById(req.params.vechileid)
        if (!vechile) {
            return res.status(404).send({error: ' No vechile found'})
        }
        const tire = await Tire.findOne({_id: req.params.tireid,vechileid :req.params.vechileid })
        if (!tire) {
            return res.send({error: ' No such file found'})
        }
        res.render("tire/Singletire.ejs",{user : req.user,token:req.token,tire:tire,vechile:vechile})
    } catch (e) {
        return res.status(404).send(e)
    }    
})

router.delete('/tire/:vechileid/:tireid/:token',auth,async (req,res)=>{
    const vechile = await Vechile.findById(req.params.vechileid)
    if (!vechile) {
        return res.status(404).send({error: ' No vechile found'})
    }
    const tire = await Tire.findOne({_id: req.params.tireid,vechileid :req.params.vechileid })
    if (!tire) {
        return res.send({error: ' No such file found'})
    }
    await tire.remove()
    res.send({vechile : vechile,user : req.user,token:req.token,tire:tire})
})



module.exports = router
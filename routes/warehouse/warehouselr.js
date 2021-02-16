const auth = require('../../middleware/auth')
const express = require('express')
const router = new express.Router()
const User = require('../../models/user')
const Lr = require('../../models/warehouselr')
const ExcelJs = require('exceljs')

function dynamicSort(property) {
    var sortOrder = 1;
    if(property[0] === "-") {
        sortOrder = -1;
        property = property.substr(1);
    }
    return function (a,b) {
        /* next line works with strings and numbers, 
         * and you may want to customize it to your needs
         */
        var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
        return result * sortOrder;
    }
}

router.get('/warehouse/warehouselr/:token',auth,async (req,res)=>{
    try {
        res.render('warehouse/lr/warehouselr',{user:req.user,token: req.token})
    } catch (error) {
        res.status(400).send(error)
    }
})

router.get('/warehouse/warehouselr/add/:token',auth,async (req,res)=>{
    try {
        res.render('warehouse/lr/addwarehouselr',{user:req.user,token: req.token})
    } catch (error) {
        res.status(400).send(error)
    }
})

router.get('/warehouse/warehouselr/view/:token',auth,async (req,res)=>{
    try {
        let warehouselr = await Lr.find({delivered : false,owner:req.user._id})
        if (!warehouselr[0]) {
            return res.send({error : 'No Lrs are there in the warehouse'})
        }
        res.render('warehouse/lr/viewlr',{user:req.user,token: req.token,warehouselr})
    } catch (error) {
        res.status(400).send(error)
    }
})

//Get single LRs
router.get('/warehouse/warehouselr/view/single/:token',auth,async (req,res)=>{
    try {
        const lr = await Lr.find({owner : req.user._id})
        const sortedlr = lr.sort(dynamicSort("-lrnumber"))
        res.render('warehouse/lr/singlelr',{lr : sortedlr,user:req.user,token: req.token})
    } catch (error) {
        res.status(400).send(error)
    }
})

router.post('/warehouse/warehouselr/add/:token',auth,async(req,res)=>{
    try {
        let warehouselr = new Lr({
            ...req.body,
            owner : req.user._id})
        warehouselr = await warehouselr.save()
        res.status(201).send({token : req.token})
    }
    catch (e) {
        res.status(400).send(e)
    }
})

router.patch('/warehouse/warehouselr/update/:lrid/:token',auth,async(req,res)=>{
    const updates = Object.keys(req.body)
    const allowedUpdates =['waybill','dateofbooking','boxes','destination','consignorname','secondtransporter','remarks','delivered']
    const isValidOperation = updates.every((update)=> allowedUpdates.includes(update))
    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid Updates!'})       
    }
    req.body.waybill.forEach(element => {
        const partsUpdates = Object.keys(element)
        const partsAllowedUpdates = ['waybillno','waybillexpirydate']
        const isValidOperation = partsUpdates.every((update)=>partsAllowedUpdates.includes(update))
        if (!isValidOperation) {
            return res.status(400).send({ error: 'Invalid Updates!'})       
        }
    })
    const secondtransporterUpdates = Object.keys(req.body.secondtransporter)
    const secondtransporterAllowedUpdates = ['name','pricecharged','date']
    const issecondtransporterValidOperation = secondtransporterUpdates.every((update)=>secondtransporterAllowedUpdates.includes(update))
        if (!issecondtransporterValidOperation) {
            return res.status(400).send({ error: 'Invalid Updates!'})       
        }
    try {
        const lr = await Lr.findOne({_id : req.params.lrid})     
         if (!lr) {
            return res.status(404).send({error : "LR is not found"})
        }
        updates.every((update)=> lr[update] = req.body[update] )
        lr.delivered = req.body.delivered
        const savedlr =  await lr.save()
        res.send({savedlr,token : req.token})
    } catch (e) {
        return res.status(404).send(e)
    }
})

router.get('/warehouse/warehouselr/:lrid/:token',auth,async (req,res)=>{
    try {
        const lr = await Lr.findOne({_id: req.params.lrid})
        if (!lr) {
            return res.status(400).send({error: ' No such file found'})
        }
        res.send(lr)
    } catch (error) {
        res.status(400).send(error)
    }
})

// router.delete('/warehouse/warehouselr/:lrid/:token',auth,async (req,res)=>{
//     try {
//         const lr = await Lr.findOne({_id: req.params.lrid})
//         if (!lr) {
//             return res.send({error: ' No such file found'})
//         }
//         await lr.remove()
//         res.send({lr,token : req.token}) 
//     } catch (error) {
//         res.status(400).send(error)
//     }
// })

//Get Selected LR for Delivering

router.post('/warehouse/warehouselr/billlr/:token',auth,async (req,res)=>{
    try {
        const billedlr = []
        const lrnumbers = req.body
        console.log(lrnumbers);
        lrnumbers.forEach(async(lr) => {
            const billlr = await Lr.find({lrnumber : lr})
            billedlr.push(billlr[0])
        });
        await Lr.find()
        billedlr.forEach(lr => {
            lr.delivered = true
            lr.save()
        });
        res.send({token : req.token})
        } catch (error) {
            res.status(400).send(error)
        }        
    })

module.exports = router
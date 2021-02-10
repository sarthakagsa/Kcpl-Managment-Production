const auth = require('../../middleware/auth')
const express = require('express')
const router = new express.Router()
const User = require('../../models/user')
const Vechile = require('../../models/vechile')
const Lr = require('../../models/llr')
const Consignor = require('../../models/consignor')
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

router.get('/lr/singlepartylr/add/:token',auth,async (req,res)=>{
    try {
        const vechile = await Vechile.find({owner : req.user._id})
        if (!vechile) {
            return res.status(400).send({error : 'The vechile is not associated with this user'})
        }
        const consignor = await Consignor.find({owner : req.user._id})
        if (!consignor) {
            return res.status(400).send({error : 'The consignor is not associated with this user'})
        }
        res.render('lr/singlePartyLr/Addlr',{user:req.user,token: req.token,vechile:vechile,consignor:consignor})
    } catch (error) {
        res.status(400).send(error)
    }
})

router.get('/lr/singlepartylr/view/:token',auth,async (req,res)=>{
    try {
        const vechile = await Vechile.find({owner : req.user._id})
        if (!vechile) {
            return res.status(400).send({error : 'The vechile is not associated with this user'})
        }
        const consignor = await Consignor.find({owner : req.user._id})
        if (!consignor) {
            return res.status(400).send({error : 'The consignor is not associated with this user'})
        }
        res.render('lr/singlePartyLr/Viewlr',{user:req.user,token: req.token,vechile:vechile,consignor:consignor})
    } catch (error) {
        res.status(400).send(error)
    }
})
//Get single LRs
router.get('/lr/singlepartylr/view/single/:token',auth,async (req,res)=>{
    try {
        const lr = []
        const vechile = await Vechile.find({owner : req.user._id})
        if (!vechile) {
            return res.status(400).send({error : 'The vechile is not associated with this user'})
        }
        vechile.forEach(async(vechile) => {
            const lrs = await Lr.find({vechileid : vechile._id})
            lrs.forEach(element => {
               lr.push(element) 
            });
        });
        const consignor = await Consignor.find({owner : req.user._id})
        if (!consignor) {
            return res.status(400).send({error : 'The consignor is not associated with this user'})
        }
        const sortedlr = lr.sort(dynamicSort("-lrnumber"))
        res.render('lr/singlePartyLr/Singlelr',{lr : sortedlr,user:req.user,token: req.token,vechile:vechile,consignor:consignor})
    } catch (error) {
        res.status(400).send(error)
    }
})

router.post('/lr/singlepartylr/:token',auth,async(req,res)=>{
    try {
        const vechile = await Vechile.findOne({_id : req.body.vechileid,owner : req.user._id})
        if (!vechile) {
            return res.status(400).send({error : 'The vechile is not associated with this user'})
        }
        const consignor = await Consignor.findOne({_id : req.body.consignorid,owner : req.user._id})
        if (!consignor) {
            return res.status(400).send({error : 'The consignor is not associated with this user'})
        }
        const lr = new Lr(req.body)
        const newLr = await lr.save()
        res.status(201).send({newLr,token : req.token})
    }
    catch (e) {
        res.status(400).send(e)
    }
})

router.patch('/lr/singlepartylr/update/:lrid/:token',auth,async(req,res)=>{
    const updates = Object.keys(req.body)
    const allowedUpdates =['date','origin','destination','partyname','invoice','boxes','loadingcharges','unloadingcharges','tolltax','snt','saletax','openingkm','closingkm','billed']
    const isValidOperation = updates.every((update)=> allowedUpdates.includes(update))
    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid Updates!'})       
    }
    try {
        const lr = await Lr.findOne({_id : req.params.lrid})     
         if (!lr) {
            return res.status(404).send({error : "LR is not found"})
        }
        updates.every((update)=> lr[update] = req.body[update] )
        lr.billed = req.body.billed
        const savedlr =  await lr.save()
        res.send({savedlr,token : req.token})
    } catch (e) {
        return res.status(404).send(e)
    }
})

router.get('/lr/singlepartylr/:lrid/:token',auth,async (req,res)=>{
    try {
        const lr = await Lr.findOne({_id: req.params.lrid})
        if (!lr) {
            return res.send({error: ' No such file found'})
        }
        res.send(lr)
    } catch (error) {
        res.status(400).send(error)
    }
})

router.delete('/lr/singlepartylr/:lrid/:token',auth,async (req,res)=>{
    try {
        const lr = await Lr.findOne({_id: req.params.lrid})
        if (!lr) {
            return res.send({error: ' No such file found'})
        }
        await lr.remove()
        res.send({lr,token : req.token}) 
    } catch (error) {
        res.status(400).send(error)
    }
})

//Get All LRS
router.post('/lr/singlepartylr/view/:token',auth,async (req,res)=>{
    try {
        if (!req.body.vechileid) {
            const lr = await Lr.find({consignorid : req.body.consignorid,billed : false}).sort({date : 1}).collation({locale: "en_US", numericOrdering: true})
            if (!lr[0]) {
                return res.status(400).send('No Lrs to be billed for th given option')
            }
            return res.send({lr : lr})
        }
        if (!req.body.consignorid) {
            const lr = await Lr.find({vechileid : req.body.vechileid,billed : false}).sort({date : 1}).collation({locale: "en_US", numericOrdering: true})
            if (!lr[0]) {
                return res.status(400).send('No Lrs to be billed for th given option')
            }
            return res.send({lr : lr})
        }
        const lr = await Lr.find({vechileid: req.body.vechileid,consignorid : req.body.consignorid,billed : false}).sort({date : 1}).collation({locale: "en_US", numericOrdering: true})
        if (!lr[0]) {
            return res.status(400).send({error: ' No such file found'})
        }
        res.send({lr : lr})
    } catch (error) {
        res.status(400).send(error)
    }
})

//Get Selected LR for billing

router.post('/lr/singlepartylr/billlr/:token',auth,async (req,res)=>{
    try {
        const billedlr = []
        const lrs = req.body
        const workbook = new ExcelJs.Workbook();
        const worksheet = workbook.addWorksheet('LR');
        worksheet.columns = [
            {header: 'S.no', key: 's_no', width: 10},
            {header: 'Date', key: 'date', width: 10},
            {header: 'Origin', key: 'origin', width: 10},
            {header: 'Party Name', key: 'partyname', width: 30},
            {header: 'Destination', key: 'destination', width: 10},
            {header: 'Invoice No', key: 'invoice', width: 40},
            {header: 'LR', key: 'lrnumber', width: 10},
            {header: 'C/B', key: 'boxes', width: 10},
            {header: 'Opening KM', key: 'openingkm', width: 10},
            {header: 'Closing KM', key: 'closingkm', width: 10},
            {header: 'Loading Charges', key: 'loadingcharges', width: 10},
            {header: 'Unloading Charges', key: 'unloadingcharges', width: 10}
        ];
        lrs.forEach(async(lr) => {
            const billlr = await Lr.findById(lr.lrid)
            billedlr.push(billlr)
        });
        worksheet.getRow(1).eachCell((cell) => {
            cell.font = {bold: true};
        });
        await Lr.find()
        let count = 1;
        billedlr.forEach(lr => {
            lr.s_no = count;
            worksheet.addRow(lr);
            count += 1;
            lr.billed = true
            lr.save()
        });
        await workbook.xlsx.writeFile('lr.xlsx')
        res.send({token : req.token})
        } catch (error) {
            res.status(400).send(error)
        }        
    })

module.exports = router
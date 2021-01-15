const mongoose = require('mongoose')
const validator = require('validator')

const lrSchema = new mongoose.Schema({
    date : {
        type : String,
        validate(value){
            if (!validator.isDate(value,{format: 'YYYY-MM-DD'})) {
                throw new Error('Date is invalid')
            }
        }
    },
    origin : {
        type : String,
        required : true
    },
    lrnumber : {
        type : String,
        required : true
    },
    partyname : {
        type : String,
        required : true
    },
    destination : {
        type : String,
        required : true
    },
    invoice : {
        type : String,
        required : true
    },
    boxes : {
        type : Number,
        required : true
    },
    loadingcharges : {
        type : Number
    },
    unloadingcharges : {
        type : Number
    },
    openingkm:{
        type : Number,
        required : true
    },
    closingkm : {
        type : Number,
        required : true
    },
    tolltax : {
        type : Number
    },
    snt : {
        type : Number
    },
    saletax : {
        type : Number
    },
    vechileid : {
        type : mongoose.Schema.Types.ObjectId,
        required : true,
        ref : 'Vechile'
    },
    consignorid : {
        type : mongoose.Schema.Types.ObjectId,
        required : true,
        ref : 'Consignor'
    }
    // consigneeid : {
    //     type : mongoose.Schema.Types.ObjectId,
    //     required : true,
    //     ref : 'Consignee'
    // }
})

const lr = mongoose.model('Lr',lrSchema)

module.exports = lr
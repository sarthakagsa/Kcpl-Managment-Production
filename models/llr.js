const mongoose = require('mongoose')
const validator = require('validator')

const newlrSchema = new mongoose.Schema({
    date : {
        type : String,
        validate(value){
            if (!validator.isDate(value,{format: 'YYYY-MM-DD'})) {
                throw new Error('Date is invalid')
            }
        },
        required : true
    },
    origin : {
        type : String,
        required : true
    },
    lrnumber : {
        type : Number,
        unique : true,
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
        type : Number
    },
    closingkm : {
        type : Number
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
    },
    billed : {
        type : Boolean,
        default : false
    }
})

const newlr = mongoose.model('newlr',newlrSchema)

module.exports = newlr
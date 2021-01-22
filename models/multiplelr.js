const mongoose = require('mongoose')
const validator = require('validator')

const multipleLrSchema = new mongoose.Schema({
    date : {
        type : String,
        validate(value){
            if (!validator.isDate(value,{format: 'YYYY-MM-DD'})) {
                throw new Error('Date is invalid')
            }
        },
        required : true
    },
    lrnumber : {
        type : Number,
        unique : true,
        required : true
    },
    details : [
        {
            partyname : {
                type : String,
                required : true
            },
            destination : {
                type : String,
                required : true
            },
            invoice : {
                type : String
            },
            invoicedate : {
                type : String,
                validate(value){
                    if (!validator.isDate(value,{format: 'YYYY-MM-DD'})) {
                        throw new Error('Date is invalid')
                    }
                }
            }
        }
    ],
    boxes : {
        type : Number,
        required : true
    },
    openingkm:{
        type : Number
    },
    closingkm : {
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

const LR = mongoose.model('multipleLr',multipleLrSchema)

module.exports = LR
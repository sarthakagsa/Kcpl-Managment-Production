const mongoose = require('mongoose')

const warehouselrSchema = new mongoose.Schema({
    dateofbooking : {
        type : Date
    },
    lrnumber : {
        type : Number,
        unique : true,
        required : true
    },
    boxes : {
        type : Number
    },
    destination : {
        type : String
    },
    consignorname : {
        type : String
    },
    secondtransporter : {
        name : {
            type : String
        },
        pricecharged : {
            type : Number
        },
        date : {
            type : Date
        },
        type : Object
    },
    remarks : {
        type : String
    },
    delivered : {
        type : Boolean,
        default : false
    },
    waybill : [{
        waybillno : {
            type : String
        },
        waybillexpirydate : {
            type : Date
        }
    }],
    owner: {
        type : mongoose.Schema.Types.ObjectId,
        required : true,
        ref : 'User'
    }
})

const warehouselr = mongoose.model('warehouselr',warehouselrSchema)

module.exports = warehouselr
const mongoose = require('mongoose')
const validator = require('validator')

const tireSchema = new mongoose.Schema({
    parts : [{
        partname : {
            type : String,
            required : true
        },
        partnumber : {
            type : String,
            required : true
        },
        cost : {
            type : Number,
            required : true,
        },
        hsn : {
            type : String,
            required : true,
        },
        quantity : {
            type : Number,
            required : true,
        }
    }],
    date : {
        type : String,
        validate(value){
            if (!validator.isDate(value,{format: 'YYYY-MM-DD'})) {
                throw new Error('Date is invalid')
            }
        }
    },
    cost :{
        type : Number,
        required : true
    },
    invoice :{
        type : String,
        uniquen: true,
        required : true
    },
    partyname :{
        type : String,
        required : true
    },
    gst :{
        type : Number,
        required : true
    },
    km :{
        type : Number,
        required : true
    },
    vechileid : {
        type : mongoose.Schema.Types.ObjectId,
        required : true,
        ref : 'Vechile'
    }
})

const Tire = mongoose.model('Tire',tireSchema)

module.exports = Tire
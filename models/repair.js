const { string } = require('joi')
const mongoose = require('mongoose')
const validator = require('validator')

const repairSchema = new mongoose.Schema({
    parts : [{
        partname : {
            type : String,
            required : true
        },
        cost : {
            type : String,
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
        type : String,
        required : true
    },
    vechileid : {
        type : mongoose.Schema.Types.ObjectId,
        required : true,
        ref : 'Vechile'
    }
})

const Repair = mongoose.model('Repair',repairSchema)

module.exports = Repair
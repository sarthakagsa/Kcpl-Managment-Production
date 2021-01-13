const mongoose = require('mongoose')

const consignorSchema = new mongoose.Schema({
    consignorname : {
        type : String,
        required : true,
        unique : true
    },
    address : {
        type : String,
        required : true
    },
    owner: {
        type : mongoose.Schema.Types.ObjectId,
        required : true,
        ref : 'User'
    }
})

const consignor = mongoose.model('Consignor',consignorSchema)

module.exports = consignor
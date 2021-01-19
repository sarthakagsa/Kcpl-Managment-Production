const mongoose = require('mongoose')
const Lr = require('./lr')

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

consignorSchema.pre('remove', async function (next){
    const consignor = this 
    await Lr.deleteMany({consignorid : consignor._id})
    next()
})

const consignor = mongoose.model('Consignor',consignorSchema)

module.exports = consignor
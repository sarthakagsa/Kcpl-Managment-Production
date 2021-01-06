const mongoose = require('mongoose')
const Repair = require('./repair')

const vechileSchema = new mongoose.Schema({
        vechileno : {
            type : String,
            required : true,
            trim : true,
            unique : true
        },
        owner: {
            type : mongoose.Schema.Types.ObjectId,
            required : true,
            ref : 'User'
        }
    },{
        timestamps : true
    }
)

vechileSchema.virtual('repairs',{
    ref : 'repairs',
    localField : '_id',
    foreignField : 'vechileid'
})

vechileSchema.pre('remove', async function (next){
    const vechile = this 
    await Repair.deleteMany({vechileid : vechile._id})
    next()
})

const vechile = mongoose.model('Vechile',vechileSchema)

module.exports = vechile
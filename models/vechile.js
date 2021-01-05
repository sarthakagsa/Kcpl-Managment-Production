const mongoose = require('mongoose')

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

const vechile = mongoose.model('Vechile',vechileSchema)

module.exports = vechile
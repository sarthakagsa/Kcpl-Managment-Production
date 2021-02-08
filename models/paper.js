const { date } = require('joi')
const mongoose = require('mongoose')

const paperSchema = new mongoose.Schema({
    pollution : {
        date : {
            type : Date
        },
        imagefilename : {
             type : String
        },
        imagefileid : {
            type : mongoose.Schema.Types.ObjectId
        },
        type : Object
    },
    authorityletter : {
        date : {
            type : Date
        },
        imagefilename : {
             type : String
        },
        imagefileid : {
            type : mongoose.Schema.Types.ObjectId
        },
        type : Object
    },
    insurance : {
        type : Date
    },
    fitness : {
        type : Date
    },
    statepermit : {
        type : Date
    },
    nationalpermit : {
        type : Date
    },
    roadtax : {
        type : Date
    },
    // images : [{
    //     filename : {
    //         type : String
    //     }
    // }],
    vechileid : {
        type : mongoose.Schema.Types.ObjectId,
        required : true,
        ref : 'Vechile'
    }
})

const Paper = mongoose.model('Papers',paperSchema)

module.exports = Paper
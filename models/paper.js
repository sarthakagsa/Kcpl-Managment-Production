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
    fitness : {
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
    statepermit : {
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
    nationalpermit : {
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
    roadtax : {
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
    vechileid : {
        type : mongoose.Schema.Types.ObjectId,
        required : true,
        unique : true,
        ref : 'Vechile'
    }
})

const Paper = mongoose.model('Papers',paperSchema)

module.exports = Paper
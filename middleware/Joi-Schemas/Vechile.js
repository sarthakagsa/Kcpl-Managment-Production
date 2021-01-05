const Joi = require('joi')

const addVechileSchema = Joi.object({
    vechileno : Joi.string().max(100)
})

module.exports = addVechileSchema
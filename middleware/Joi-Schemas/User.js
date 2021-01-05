const Joi = require('joi')

const signupSchema = Joi.object({
    name : Joi.string().max(100),
    email : Joi.string().email().required().trim(),
    password : Joi.string().min(8).max(15).trim()
})

const loginSchema = Joi.object({
    email : Joi.string().email().required().trim(),
    password : Joi.string().min(8).max(15).trim()
})

const updateSchema = Joi.object({
    name : Joi.string().max(100),
    password : Joi.string().min(8).max(15).trim()
}) 

module.exports = {signupSchema,loginSchema,updateSchema}
const express = require('express')
const router = express.Router()
const User = require('../models/user')
const {signupSchema,loginSchema,updateSchema} = require('../middleware/Joi-Schemas/User')
const auth = require('../middleware/auth')
const bcrypt = require('bcrypt')

router.post('/signup',async (req,res)=>{
    try {
        const validateduser = await signupSchema.validateAsync(req.body)
        const user = new User(validateduser)
        await user.save()
        const token = await user.generateAuthToken()
        res.send({user,token})
    } catch (error) {
        res.status(400).send(error)
    }
})

router.post('/login', async (req,res)=>{
    try {
        const validateddata = await loginSchema.validateAsync(req.body)
        const user = await User.findByCredentials(validateddata.email,validateddata.password)
        const token = await user.generateAuthToken()
        res.send({user,token})
    } catch (error) {
        res.status(400).send({error : error.message})
    }
})

router.get('/users/me',auth,async(req,res)=>{
    res.send(req.user)
})

router.post('/users/logout',auth,async (req,res)=>{
    try {
        req.user.tokens = req.user.tokens.filter((token)=>{
            return token.token != req.token
        })
        await req.user.save()

        res.send({message : 'User is logged out',token : req.token})
    } catch (e) {
        res.status(500).send()
    }
})

router.post('/users/logoutAll',auth,async (req,res)=>{
    try {
        req.user.tokens = []
        await req.user.save()
        res.send({message : 'User has been loged out from all devices'})
    } catch (e) {
        res.status(500).send()
    }
})

router.patch('/users/me',auth,async(req,res)=>{
    if (!await bcrypt.compare(req.body.oldpassword,req.user.password)) {
        return res.status(400).send({error : 'Old password doesnot match with the one given'})
    }
    const updates = Object.keys(req.body.data)
    const allowedUpdates =['name','password']
    const isValidOperation = updates.every((update)=> allowedUpdates.includes(update))
    if (!isValidOperation) {
        res.status(400).send({ error: 'Invalid Updates!'})       
    }
    try {
        await updateSchema.validateAsync(req.body.data)
        const user = await req.user
        updates.every((update)=> user[update] = req.body.data[update])

        await user.save()

        //const user = await User.findByIdAndUpdate(req.params.id,req.body,{new : true, runValidators : true})
        res.send(user)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.delete('/users/me',auth,async(req,res)=>{
    try {
        await req.user.remove()
        res.send(req.user)
    } catch (e) {
        res.status(400).send(e.message)
    }
})

module.exports = router 
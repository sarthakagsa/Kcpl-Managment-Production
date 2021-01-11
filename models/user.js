const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const Vechile = require('./vechile')
const vechile = require('./vechile')

const userSchema = new mongoose.Schema({
    name : {
        type : String,
        required : true,
        trim : true
    },
    email : {
        type : String,
        unique : true,
        required : true,
        trim : true,
        lowercase : true,
        validate(value){
            if (!validator.isEmail(value)) {
                throw new Error('Emaill is invalid')
            }
        }
    },
    password : {
        type : String,
        required : true,
        minlength : 8,
        trim : true,
        validate(value){
            if (value.toLowerCase().includes('password') ) {
                throw new Error('Password cannot contain password')
            }
        }
    },
    tokens : [{
        token : {
            type : String,
            required : true
        }
    }]
})

userSchema.virtual('vechiles',{
    ref : 'vechiles',
    localField : '_id',
    foreignField : 'owner'
})

userSchema.pre('save',async function(next){
    const user = this

    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password,8)
    }
    next()
})

userSchema.methods.generateAuthToken = async function(){
    const user = this

    const token = jwt.sign({_id: user._id.toString()},process.env.JWT_SECRET)

    user.tokens = user.tokens.concat({token})
    await user.save()
 
    return token
}

userSchema.statics.findByCredentials = async (email,password)=>{
    const user = await User.findOne({email})
    if (!user) {
        throw new Error('email address not found!')
    }
    const isMatch = await bcrypt.compare(password,user.password)

    if (!isMatch) {
        throw new Error('password not correct')
    }
    return user
}

userSchema.methods.toJSON = function(){
    const user = this
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens

    return userObject
}

userSchema.pre('remove', async function (next){
    const user = this 
    const vechiles = await Vechile.find({owner : user._id})
    vechiles.forEach(vechile => {
        vechile.remove()
    });
    next()
})

const User = mongoose.model('User',userSchema)

module.exports = User
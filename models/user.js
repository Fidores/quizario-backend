const mongoose = require('mongoose');
const Joi = require('joi');
const jwt = require('jsonwebtoken');
const config = require('config');

const { Game } = require('./game');
const { Bookmark } = require('./bookmark');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        maxlength: 128,
        minlength: 3
    },
    surname: {
        type: String,
        required: true,
        maxlength: 128,
        minlength: 3
    },
    password: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 255
    },
    email: {
        type: String,
        unique: true,
        required: true,
        maxlength: 128,
        match: /[a-z0-9\._%+!$&*=^|~#%'`?{}/\-]+@([a-z0-9\-]+\.){1,}([a-z]{2,16})/
    },
    registrationTime: {
        type: Date,
        default: Date.now
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    gamesHistory: {
        type: [ Game ],
    },
    bookmarks: {
        type: [ Bookmark ]
    }
});

UserSchema.methods.generateAuthToken = function () {
    return jwt.sign({
        _id: this._id,
        isAdmin: this.isAdmin
    }, config.get('jwtPrivateKey'));
}

const User = mongoose.model('User', UserSchema);

function validateUser(user) {

    const scheme = {
        name: Joi.string().required().min(3).max(128),
        surname: Joi.string().required().min(3).max(128),
        email: Joi.string().required().email().max(128),
        password: Joi.string().required().min(5).max(255)
    }

    return Joi.validate(user, scheme);
}

function validateUpdate(user) {
    const scheme = {
        name: Joi.string().min(3).max(128),
        surname: Joi.string().min(3).max(128),
        email: Joi.string().email().max(128),
        password: Joi.string().min(5).max(255).allow('')
    }

    return Joi.validate(user, scheme);
}

module.exports.User = User;
module.exports.validate = validateUser;
module.exports.validateUpdate = validateUpdate;
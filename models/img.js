const mongoose = require('mongoose');
const Joi = require('joi');

const ImgSchema = new mongoose.Schema({
    binaryData: { type: Buffer, contentType: String },
    header: { type: String },
    _id: false
});

const ValidationSchema = Joi.string().allow('');

function validate(img) {
    return Joi.validate(img, ValidationSchema);
}

module.exports.Img = ImgSchema;
module.exports.ValidationSchema = ValidationSchema;
module.exports.validate = validate;
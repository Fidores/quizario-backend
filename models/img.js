const mongoose = require('mongoose');
const Joi = require('joi');

const ImgSchema = new mongoose.Schema({
    binaryData: { type: Buffer, contentType: String },
    header: { type: String },
    _id: false
});

const ValidationSchema = Joi.string().allow('');

module.exports.Img = ImgSchema;
module.exports.ValidationSchema = ValidationSchema;
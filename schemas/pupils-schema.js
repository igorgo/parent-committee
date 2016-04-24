/**
 * Created by igorgo on 20.04.2016.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var pupilsSchema = new Schema({
    rn: Number,
    name: {
        first: String,
        middle: String,
        last: String
    },
    birthday: Date,
    gender: String,
    email: String,
    address: {
        live: String,
        reg: String
    },
    phone: {
        home: String,
        cell: String
    },
    studied: {
        from: Date,
        till: Date
    },
    mother: {
        name: {
            first: String,
            middle: String,
            last: String
        },
        birthday: Date,
        email: String,
        phone: String,
        work: {
            place : String,
            post: String,
            phone: String
        }
    },
    father: {
        name: {
            first: String,
            middle: String,
            last: String
        },
        birthday: Date,
        email: String,
        phone: String,
        work: {
            place : String,
            post: String,
            phone: String
        }
    }
});


module.exports = pupilsSchema;
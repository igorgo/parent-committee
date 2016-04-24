/**
 * Created by igorgo on 20.04.2016.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var countersSchema = new Schema({
    _id: String,
    seq: Number
});

countersSchema.statics.increment = function (counter, callback) {
    return this.findByIdAndUpdate(
        counter,
        {$inc: {seq: 1}},
        {new: true, upsert: true, select: {seq: 1}},
        callback);
};

module.exports = countersSchema;
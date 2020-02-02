console.log('- bookinstance.js');

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var moment = require('moment');

var BookInstanceSchema = new Schema(
  {
    book: { type: Schema.Types.ObjectId, ref: 'Book', required: true }, //reference to the associated book
    imprint: {type: String, required: true},
    status: {type: String, required: true, enum: ['Available', 'Maintenance', 'Loaned', 'Reserved'], default: 'Maintenance'},
    reserved_by: { type: String},
    loaned_by: {type: String},
    // reserved_by: { type: Schema.Types.ObjectId, ref: 'User', required: true},
    due_back: {type: Date, default: Date.now}
  }
);

// Virtual for bookinstance's URL
BookInstanceSchema
.virtual('url')
.get(function () {
  return '/catalog/bookinstance/' + this._id;
});

// Virtual property created due_back_formatted to eg Tu 10 Oct 2019
BookInstanceSchema
.virtual('due_back_formatted')
.get( function () {
  return moment(this.due_back).format('dd Do MMMM YYYY') });

// Virtual property created due_back_for_update to eg 2019-11-14
BookInstanceSchema
.virtual('due_back_for_update')
.get( function () {
  return moment(this.due_back).format('YYYY-MM-DD') });

//Export model
module.exports = mongoose.model('BookInstance', BookInstanceSchema);

console.log('bookinstance.js');

console.log('- ../models/userModel.js')

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema(
  {
    username: {type: String, required: true},

    password: {type: String, required: true }
  }
)

// Virtual for user URL
UserSchema.virtual('url')
.get(function () {
  return '/user/'+this._id;
})

//Export model
module.exports = mongoose.model('User', UserSchema)

console.log('../models/userModel.js')
console.log('- genre.js');

var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var GenreSchema = new Schema(
  {
    //reference to the associated book
    //book: { type: Schema.Types.ObjectId, ref: 'Book', required: true }, 
    
    name: {type: String, required: true, min:3 , max:100 },
    
  }
);

// Virtual property for genre name
GenreSchema
.virtual('genreType')
.get(function () {
  return this.name ;
});

// Virtual for genre's URL
GenreSchema
.virtual('url')
.get(function () { return '/catalog/genre/' + this._id
});


//Export model
module.exports = mongoose.model('Genre', GenreSchema);

console.log('genre.js');

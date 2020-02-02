console.log('- author.js');

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var moment = require('moment');
 
var AuthorSchema = new Schema(
  {
    first_name: {type: String, required: true, max: 100},
    family_name: {type: String, required: true, max: 100},
    date_of_birth: {type: Date},
    date_of_death: {type: Date},
  }
);
 
// Virtual property 'name' for author's full name
AuthorSchema
.virtual('name')
.get( function() { return this.family_name + ', ' + this.first_name; } );

// Virtual property for author's dateOfBirth
AuthorSchema
.virtual('dateOfBirth')
.get( function(){ return this.date_of_birth?
  moment(this.date_of_birth).format('dd Do MMM YYYY'): '';
});
// Virtual property for author's dateOfBirth as YYYY-MM-DD
AuthorSchema
.virtual('DOBYYYYMMDD')
.get( function(){ return this.date_of_birth?
  moment(this.date_of_birth).format('YYYY-MM-DD'): '';
});

// Virtual property for author's dateOfDeath
AuthorSchema
.virtual('dateOfDeath')
.get( function(){ return this.date_of_death?
  moment(this.date_of_death).format('dd Do MMM YYYY'): '';
});
// Virtual property for author's dateOfDeath as YYYY-MM-DD
AuthorSchema
.virtual('DODYYYYMMDD')
.get( function(){ return this.date_of_death?
  moment(this.date_of_death).format('YYYY-MM-DD'): '';
});

// Virtual for author's lifespan
AuthorSchema
.virtual('lifespan')
.get( function(){ return (this.date_of_death.getYear() - this.date_of_birth.getYear()).toString(); });
 
// Virtual property 'url' for author's URL
AuthorSchema
.virtual('url')
.get( function()  { return '/catalog/author/' + this._id} );
 
//Export model
module.exports = mongoose.model('Author', AuthorSchema);

console.log('author.js');

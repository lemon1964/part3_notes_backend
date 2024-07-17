const mongoose = require('mongoose');

if (process.argv.length < 3) {
  console.log('give password as argument');
  process.exit(1);
}

const password = process.argv[2];

const url = `mongodb+srv://sv444444:${password}@fullstack.gbitkdt.mongodb.net/noteApp?retryWrites=true&w=majority&appName=fullstack`;

mongoose.set('strictQuery', false);

mongoose.connect(url).catch((error) => {
  console.error('Error connecting to MongoDB:', error);
});

const noteSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
  },
  important: {
    type: Boolean,
    required: true,
  },
});

const Note = mongoose.model('Note', noteSchema);

if (process.argv.length === 5) {
  const note = new Note({
    content: process.argv[3],
    important: process.argv[4] === 'true',
  });

  note.save()
    .then((result) => {
      console.log('added note:', result.content, 'important:', result.important);
      mongoose.connection.close();
    })
    .catch((error) => {
      console.error('Error saving note to MongoDB:', error);
      mongoose.connection.close();
    });
} else if (process.argv.length === 3) {
  Note.find({})
    .then((result) => {
      console.log('notes:');
      result.forEach((note) => {
        console.log(note.content, 'important:', note.important);
      });
      mongoose.connection.close();
    })
    .catch((error) => {
      console.error('Error retrieving notes from MongoDB:', error);
      mongoose.connection.close();
    });
} else {
  console.log('Invalid number of arguments');
  mongoose.connection.close();
}

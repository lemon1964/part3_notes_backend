require('dotenv').config();
const Note = require('./models/note') 

const express = require('express')
const app = express()
app.use(express.static('dist'));

const cors = require('cors')
app.use(cors())

app.use(express.json())

const morgan = require('morgan')
morgan.token('body', function (req, res) { 
  return JSON.stringify(req.body)
  })

morgan.format('combined', ':method :url :status :res[content-length] - :response-time ms :body')
app.use(morgan('combined'))

// let notes = [
//   {
//     "id": "1",
//     "content": "HTML is easy",
//     "important": true
//   },
//   {
//     "id": "2",
//     "content": "Browser can execute only JavaScript",
//     "important": false
//   },
//   {
//     "id": "3",
//     "content": "GET and POST are the most important methods of HTTP protocol",
//     "important": false
//   },
//   {
//     "id": "4",
//     "content": "Array.prototype.indexOf()",
//     "important": true
//   },
// ]

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
  }

app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>')
})

app.get('/info', (request, response) => {
  response.send(
    '<p>Notebook has info for ' + notes.length + ' notes</p>'
    + '<p>' + new Date() + '</p>'
  )
})

app.get('/api/notes', (request, response) => {
  Note.find({}).then(notes => {
    response.json(notes)
  })
})
// app.get('/api/notes', (request, response) => {
//     response.json(notes)
//   })

app.post('/api/notes', (request, response) => {
  const body = request.body

  if (body.content === undefined) {
    return response.status(400).json({ error: 'content missing' })
  }

  const note = new Note({
    content: body.content,
    important: body.important || false,
  })

  note.save().then(savedNote => {
    response.json(savedNote)
  })
})

// const generateId = () => {
//   const Id = notes.length > 0
//     ? Math.floor(Math.random() * 5 + Math.max(...notes.map(n => n.id)) + 1)
//     : 1
//   return Id
// }

// app.post('/api/notes', (request, response) => {
//   const body = request.body

//   if (!body.content) {
//     return response.status(400).json({ 
//       error: 'content missing' 
//     })
//   }

//   if (notes.map((note) => note.content).includes(body.content)) {
//     return response.status(400).json({ 
//       error: 'This content is already added to phonebook' 
//     })
//   }

//   const note = {
//     content: body.content,
//     important: body.important,
//     id: generateId(),
//   }

//   notes = notes.concat(note)

//   response.json(note)
// })

app.get('/api/notes/:id', (request, response) => {
  Note.findById(request.params.id)
    .then(note => {

      if (note) {
        response.json(note)
      } else {
        response.status(404).end()
      }
    })

    .catch(error => next(error))
})
// app.get('/api/notes/:id', (request, response) => {
//   Note.findById(request.params.id).then(note => {
//     response.json(note)
//   })
// })

// app.get('/api/notes/:id', (request, response) => {
//   const id = Number(request.params.id)
//   const note = notes.find(note => note.id === String(id) || note.id === id)
//   if (note) {
//     response.json(note)
//   } else {
//     console.log('x')
//     response.status(404).end()
//   }
// })

// app.delete('/api/notes/:id', (request, response) => {
//   const id = Number(request.params.id)
//   notes = notes.filter(note => note.id !== id && note.id !== String(id))

//   response.status(204).end()
// })
app.delete('/api/notes/:id', (request, response) => {
  Note.findByIdAndDelete(request.params.id)
    .then(() => {
      response.status(204).end();
    })
    .catch(error => next(error))
});

app.put('/api/notes/:id', (request, response, next) => {
  const body = request.body

  const note = {
    content: body.content,
    important: body.important,
  }

  Note.findByIdAndUpdate(request.params.id, note, { new: true })
    .then(updatedNote => {
      response.json(updatedNote)
    })
    .catch(error => next(error))
})

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } 

  next(error)
}

// this has to be the last loaded middleware, also all the routes should be registered before this!
app.use(errorHandler)
  
const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})


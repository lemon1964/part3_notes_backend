require('dotenv').config()
const Note = require('./models/note')

const express = require('express')
const app = express()
app.use(express.static('dist'))

const cors = require('cors')
app.use(cors())

app.use(express.json())

const morgan = require('morgan')
morgan.token('body', function (request) {
  return JSON.stringify(request.body)
})

morgan.format(
  'combined',
  ':method :url :status :res[content-length] - :response-time ms :body'
)
app.use(morgan('combined'))

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.get('/', (request, response, next) => {
  response.send('<h1>Hello World!</h1>')
    .catch((error) => next(error))
})

app.get('/info', (request, response, next) => {
  Note.countDocuments({})
    .then((count) => {
      response.send(
        `<p>Phonebook has info for ${count} notes</p>
         <p>${new Date()}</p>`
      )
    })
    .catch((error) => next(error))
})

app.get('/api/notes', (request, response, next) => {
  Note.find({}).then((notes) => {
    response.json(notes)
  })
    .catch(error => next(error))
})

app.post('/api/notes', (request, response, next) => {
  const body = request.body

  const note = new Note({
    content: body.content,
    important: body.important || false,
  })

  note
    .save()
    .then((savedNote) => {
      response.json(savedNote)
    })

    .catch((error) => next(error))
})

app.get('/api/notes/:id', (request, response, next) => {
  Note.findById(request.params.id)
    .then((note) => {
      if (note) {
        response.json(note)
      } else {
        response.status(404).end()
      }
    })
    .catch((error) => next(error))
})

app.delete('/api/notes/:id', (request, response, next) => {
  Note.findByIdAndDelete(request.params.id)
    .then(() => {
      response.status(204).end()
    })
    .catch((error) => next(error))
})

app.put('/api/notes/:id', (request, response, next) => {
  const { content, important } = request.body

  Note.findByIdAndUpdate(
    request.params.id,

    { content, important },
    { new: true, runValidators: true, context: 'query' }
  )
    .then((updatedNote) => {
      response.json(updatedNote)
    })
    .catch((error) => next(error))
})

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

// this has to be the last loaded middleware, also all the routes should be registered before this!
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

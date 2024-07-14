const express = require('express')
const app = express()
app.use(express.static('dist'));

// const requestLogger = (request, response, next) => {
//   console.log('Method:', request.method)
//   console.log('Path:  ', request.path)
//   console.log('Body:  ', request.body)
//   console.log('---')
//   next()
// }

const cors = require('cors')
app.use(cors())

app.use(express.json())
// app.use(requestLogger)

const morgan = require('morgan')
morgan.token('body', function (req, res) { 
  return JSON.stringify(req.body)
  })

morgan.format('combined', ':method :url :status :res[content-length] - :response-time ms :body')
app.use(morgan('combined'))

let notes = [
  {
    "id": "1",
    "content": "HTML is easy",
    "important": true
  },
  {
    "id": "2",
    "content": "Browser can execute only JavaScript",
    "important": false
  },
  {
    "id": "3",
    "content": "GET and POST are the most important methods of HTTP protocol",
    "important": false
  },
  {
    "id": "4",
    "content": "Array.prototype.indexOf()",
    "important": true
  },
  // {
  //   "id": "5",
  //   "content": "Array.prototype.find()",
  //   "important": false
  // },
  // {
  //   "id": "6",
  //   "content": "POST is easy",
  //   "important": true
  // },
  // {
  //   "id": "7",
  //   "content": "only JavaScript",
  //   "important": false
  // }
]

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
  response.json(notes)
})

const generateId = () => {
  const Id = notes.length > 0
    ? Math.floor(Math.random() * 5 + Math.max(...notes.map(n => n.id)) + 1)
    : 1
  return Id
}

app.post('/api/notes', (request, response) => {
  const body = request.body

  if (!body.content) {
    return response.status(400).json({ 
      error: 'content missing' 
    })
  }

  if (notes.map((note) => note.content).includes(body.content)) {
    return response.status(400).json({ 
      error: 'This content is already added to phonebook' 
    })
  }

  const note = {
    content: body.content,
    important: body.important,
    id: generateId(),
  }

  notes = notes.concat(note)

  response.json(note)
})

app.get('/api/notes/:id', (request, response) => {
  const id = Number(request.params.id)
  const note = notes.find(note => note.id === String(id) || note.id === id)
  if (note) {
    response.json(note)
  } else {
    console.log('x')
    response.status(404).end()
  }
})

app.delete('/api/notes/:id', (request, response) => {
  const id = Number(request.params.id)
  notes = notes.filter(note => note.id !== id && note.id !== String(id))

  response.status(204).end()
})

app.use(unknownEndpoint)
  
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

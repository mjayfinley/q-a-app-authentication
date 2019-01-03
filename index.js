const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const path = require('path')
const jwt = require('express-jwt')
const jwksRsa = require('jwks-rsa')
// const mustacheExpress = require('mustache-express') // example for using server side views

// I mentioned this bit of code already, just make sure that it's in the server once at the top of the file
if (process.env.NODE_ENV == 'development') {
  require('dotenv').config()
}

const app = express()

// this is so that express can parse the incoming `req.body` into json, somewhere at the top of the server file:
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())


// to prevent security threats, Helmet will set headers to sensible defaults, and allows tweaking them as needed:
app.use(helmet())

app.use(cors())

app.use(morgan('combined'))

//database

const questions = [
  {
    'id': 1,
    'title': 'How do I make a sandwhich?',
    'description': 'I am trying very hard, but I do not know how to make a sandwhich',
    'answers': [
      {
        'answer': 'Just spread butter on the bread, and that is it.'
      }
    ],
  },
  {
    'id': 2,
    'title': 'What is React?',
    'description': 'I have been hearing a lot about React. What is it?',
    'answers': [],
  },
];

// ROUTES GO HERE

//retrieve all questions
app.get('/', function (req, res, next) {
  const qs = questions.map(q => ({
    id: q.id,
    title: q.title,
    description: q.description,
    answers: q.answers.length,
  }))
  res.send(qs)
})

//get a specific question
app.get('/:id', (req,res) => {
  const question = questions.filter(q => (q.id === parseInt(req.params.id)))
  if (question.length > 1) return res.status(500).send()
  if (question.length === 0) return res.status(404).send()

  res.send(question[0])
})

const checkJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://mjayfinley.auth0.com/.well-known/jwks.json`
  }),

  audience: 'Y2JhEXmNRr0kwOibqonXubZLharoiPzw',
  issuer: `https://mjayfinley.auth0.com/`,
  algorithms: ['RS256']
})

//insert new question
app.post('/', checkJwt, (req,res) => {
  const {title, description} = req.body;
  const newQuestion = {
    id: questions.length + 1,
    title,
    description,
    answers: [],
    author: req.user.name,
  }
  questions.push(newQuestion);
  res.status(200).send()
})

//insert a new answer to question
app.post('/answer/:id', checkJwt, (req, res) => {
  const {answer} = req.body;

  const question = questions.filter(q => (q.id === parseInt(req.params.id)))
  if (question.length > 1) return res.status(500).send()
  if (question.length === 0) return res.status(404).send()

  question[0].answers.push({
    answer,
    authoer: req.user.name,
  })

  res.status(200).send()
})

// below all of the routes:
if (process.env.NODE_ENV === 'production') {
  // if the client is a create-react-app, go to the .gitignore in the client folder, and take out
  // the word 'build' so that it isn't hidden from git and heroku

  // serves up the static files
  app.use(express.static('client/build'))
  // if the app is a single page app, like a react app that uses react router for example
  app.get('*', (req, res) =>
    res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'))
  )
}

// at the bottom of the server file, set the port like this, so that heroku can set the port when the server is being hosted there
app.listen(8081, () => {
  console.log('listening on port 8081')
})

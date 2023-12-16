const express = require('express');
const cors = require('cors');

const connectToMongo = require('./db');

const app = express();
const port = process.env.PORT || 5000;


//middleware
app.use(cors(
{
    origin: '*',
    methods: ["POST", "GET" , "PUT" , "DELETE"],
    credentials: true
}));
app.use(express.json()) //if we dont use this req.body will print undefined

//Available routes
app.use('/api/auth', require('./routes/auth'))
app.use('/api/notes', require('./routes/notes'))

app.get('/', (req, res) => {
    res(req);
})
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
})
connectToMongo();

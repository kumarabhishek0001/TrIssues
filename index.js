const chalk = require('chalk');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const express = require('express');
const app = express()
const port = 3002;

app.use(express.json());

const { usersModel, boardModel, boardMemeberModel, listModel, cardModel, checkListModel, commentModel } = require('./models')

app.get('/', (req, res) => {
    res.send('working!!')
})

app.post('/signup', async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if(!username || !password){
        return res.status(400).json({
            message : "Missing credentials"
        })
    }

    const user = await usersModel.findOne({
        username
    });

    if(user){
        return res.status(409).json({
            message: "User already exists"
        })
    }

    const userData = {
        username,
        password,
    }
    
    const newUser = await usersModel.create(userData);

    res.status(201).json({
        message : "user createded",
        userId: newUser._id
    })
});


app.post('/signin', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if(!username || !password){
        return res.status(400).json({
            message : "Missing credentials"
        })
    }

    const user = usersModel.findOne({
        username,password
    })

    if(!user){
        return res.status(401).json({
            message: "Invalid credentials"
        })
    }

    const token = jwt.sign({
        username
    }, process.env.JWT_KEY)

    res.json({
        token
    })


})

app.listen(port, (req, res) => {
    console.log("app listening on: " + chalk.green(`http://localhost:${port}/`));
})
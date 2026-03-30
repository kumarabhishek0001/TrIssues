const chalk = require('chalk');

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
})

app.listen(port, (req, res) => {
    console.log("app listening on: " + chalk.green(`http://localhost:${port}/`));
})
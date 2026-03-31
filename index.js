const chalk = require('chalk');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const express = require('express');
const app = express()
const port = 3002;

app.use(express.json());

const { usersModel, boardModel, boardMemeberModel, listModel, cardModel, checkListModel, commentModel } = require('./models')
const { authMiddleWare } = require('./authmiddleware')

app.get('/', (req, res) => {
    res.send('working!!')
})
// CREATE ENDPOINTS
// SIGN UP, SIGN IN, CREATE BOARD, CREATE LIST, CREATE CARD, CREATE CHECKLIST, ADD COMMENT

app.post('/signup', async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        return res.status(400).json({
            message: "Missing credentials"
        })
    }

    const user = await usersModel.findOne({
        username
    });

    if (user) {
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
        message: "user createded",
        userId: newUser._id
    })
});


app.post('/signin', async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        return res.status(400).json({
            message: "Missing credentials"
        })
    }

    const user = await usersModel.findOne({
        username, password
    })


    if (!user) {
        return res.status(401).json({
            message: "Invalid credentials"
        })
    }

    const userId = user._id

    const token = jwt.sign({
        userId
    }, process.env.JWT_KEY)

    res.json({
        token
    })


})

app.post('/createBoard', authMiddleWare, async (req, res) => {
    const userId = req.userId;
    // console.log(userId);
    const user = await usersModel.findById(userId);
    // console.log(user)

    const boardName = req.body.boardName;
    const isPublic = req.body.isPublic;

    if (!user) {
        // USER DOES NOT EXIST
        return res.status(401).json({
            message: "user does not exist"
        })
    } else {
        // USER EXIST, SO WE CAN CREATE A BOARD 
        const boardData = {
            boardName,
            userId,
            isPublic
        }

        try {

            const newBoard = await boardModel.create(boardData);

            res.status(201).json({
                message: "success",
                // boardId: newBoard._id,
                // "board name": newBoard.boardName,
                // "createdAt": newBoard.createdAt,
                // "is Public": newBoard.isPublic,
                // "created by": newBoard.userId
            })

        } catch (error) {
            console.log(chalk.red('Failed to create user board'));
            console.log(error);
        }


    }

})

app.listen(port, (req, res) => {
    console.log("app listening on: " + chalk.green(`http://localhost:${port}/`));
})
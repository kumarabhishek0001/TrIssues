const chalk = require('chalk');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const express = require('express');
const app = express()
const port = 3002;

app.use(express.json());

const { usersModel, boardModel, boardMemeberModel, listModel, cardModel, checkListModel, commentModel } = require('./models')
const { authMiddleWare } = require('./authmiddleware');
const authmiddleware = require('./authmiddleware');

app.get('/', (req, res) => {
    res.send('working!!')
})
// CREATE ENDPOINTS
// SIGN UP, SIGN IN, CREATE BOARD, CREATE LIST, CREATE CARD, CREATE CHECKLIST, ADD COMMENT, ADD MEMBER

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

// CREATE BOARD
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

        // // CHECK OF BOARD WITH SAME NAME EXIST
        // const boardExist = await boardModel.findOne({
        //     boardName,
        //     userId,
        // })

        // if(boardExist){
        //     return res.status(409).json({
        //         message: "same board name already exist"
        //     })
        // }

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

            if(error.code === 11000){
                console.log(chalk.red('Board alread exist'))
                return res.status(400).json({
                    message: "Board already exist"
                })
            }
            
            return res.status(400).json({
                message: "error occured while creating board"
            })
        }


    }

})

// ADD MEMBER
app.post('/addMember/:boardId/:memberUsername', authMiddleWare,  async (req, res) => {
    // CONSTRAINTS
    // kya board public hai -> directly check karlo
    const boardId = req.params.boardId;
    const userId = req.userId;
    const newMemberUsername = req.params.memberUsername;

    // CHECK IF THE NEW USER IS VALID
    const validNewUser = await usersModel.findOne({
        username: newMemberUsername
    })

    if(process.env.NODE_ENV==='development') console.log('new user: ',validNewUser, validNewUser._id)

    if(!validNewUser){
        return res.status(400).json({
            message: "User does not exist. Please Enter a valid username"
        })
    }

    const getBoard = await boardModel.findById({
        _id : boardId
    });

    if(process.env.NODE_ENV==='development') console.log(getBoard)

    if(!getBoard){
        if(process.env.NODE_ENV === 'development') console.log(chalk.red('[add member]: no such board exists'));

        return res.status(401).json({
            message: "board not found"
        })
    }

    if(!getBoard.isPublic){
        if(process.env.NODE_ENV === 'development') console.log('isPublic: ', getBoard.isPublic)
        return res.status(403).json({
            message: "It is a private board"
        })
    }

    const isAdmin = getBoard.userId.equals(userId);

    if(process.env.NODE_ENV === 'development'){
        console.log(chalk.red('isAdmin: ', isAdmin))
    }

    if(isAdmin){
        const boardMemberpair = {
            userId: validNewUser._id,
            boardId
        }

        if(process.env.NODE_ENV === 'development') console.log(chalk.blue(JSON.stringify(boardMemberpair)));

        try{
            const newBoardMember = await boardMemeberModel.create(boardMemberpair);

            return res.json({
                message: "New Member added successfully"
            })
        }
        catch(error){
            if(error.code === 11000){
                if(process.env.NODE_ENV === 'development') console.log(chalk.red('This user is alread part of this board'))
                return res.status(400).json({
                    message: "This user is alread part of this board"
                })
            }

            console.log(chalk.red('cannot add this member'))
            console.log(error);
            return res.status(400).json({
                message: "Some error occured while adding this member"
            })
        }
            

    }
    

    // kya mere user ne wo board banaya hai jisme wo member add karna chahta hai 
    // -> pehle wo board lao jisse user edit karna chahta hai
})


app.listen(port, (req, res) => {
    console.log("app listening on: " + chalk.green(`http://localhost:${port}/`));
})
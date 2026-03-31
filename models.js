const chalk = require('chalk');
require('dotenv').config();

// connecting to db
const mongoose = require('mongoose');

async function connectDb(){
    console.log(chalk.blue('connecting'));
    await mongoose.connect(process.env.DB_KEY);
    console.log(chalk.green('connected successfully'))
}

connectDb().catch((err) => {
    console.log(chalk.red('cannot connect to db'))
    console.log(err);
})

// create schema

// USERS
const userSchema = mongoose.Schema({
    username: String,
    password: String,
    createdAt: {type: Date, default: Date.now}
});

// BOARDS
const boardSchema = mongoose.Schema({
    userId: mongoose.Types.ObjectId,
    boardName: String,
    isPublic: Boolean,
    createdAt: {type: Date, default: Date.now}
});

boardSchema.index({userId: 1, boardName: 1}, {unique: true});

// BOARD MEMBERS
const boardMemberSchema = mongoose.Schema({
    userId: mongoose.Types.ObjectId,
    boardId: mongoose.Types.ObjectId
})

boardMemberSchema.index({userId: 1, boardId: 1}, {unique: true})

// LISTS
const listSchema = mongoose.Schema({
    boardId: mongoose.Types.ObjectId,
    listName: String,
    position: Number
})

listSchema.index({boardId: 1, listName: 1}, {unique: true});

// CARD
const cardSchema = mongoose.Schema({
    listId: mongoose.Types.ObjectId,
    cardName: String,
    createdAt: {type: Date, default: Date.now}
})

// CHECK LIST
const checkListSchema = mongoose.Schema({
    cardId: mongoose.Types.ObjectId,
    checkListDescription: String,
    isChecked: Boolean,
    position: Number
})

// COMMENTS
const commentsSchema = mongoose.Schema({
    userId: mongoose.Types.ObjectId,
    cardId: mongoose.Types.ObjectId,
    comment: String,
    createdAt: {type: Date, default: Date.now}
})

// making MODLES
const usersModel = mongoose.model('users', userSchema);
const boardModel = mongoose.model('boards', boardSchema);
const boardMemeberModel = mongoose.model('board_members', boardMemberSchema);
const listModel = mongoose.model('lists', listSchema);
const cardModel = mongoose.model('cards', cardSchema);
const checkListModel = mongoose.model('checklists', checkListSchema);
const commentModel = mongoose.model('comments', commentsSchema);


module.exports = {
    usersModel: usersModel,
    boardModel: boardModel,
    boardMemeberModel: boardMemeberModel,
    listModel: listModel,
    cardModel: cardModel,
    checkListModel: checkListModel,
    commentModel: commentModel
}
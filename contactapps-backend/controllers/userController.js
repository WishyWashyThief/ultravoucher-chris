const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
//@desc Register a user
//@route POST /api/users/register
//@access public
const registerUser = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;
    if(!username || !email || !password) {
        res.status(400);
        throw new Error('Please add all fields');
    }
    const userExists = await User.findOne({email});
    if(userExists){
        res.status(400);
        throw new Error('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    console.log(hashedPassword);
    const user = await User.create({
        username,
        email,
        password: hashedPassword
    });
    console.log(`User created: ${user}`);
    if(user) {
       res.status(201).json({
           _id: user.id,
           email: user.email,
       });
    } else {
       res.status(400);
       throw new Error('Creating user failed');
    }
   res.json({ message: 'Register the user' });
});

//@desc Login a user
//@route POST /api/users/login
//@access public
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if(!email || !password) {
        res.status(400);
        throw new Error('Please add all fields');
    }

    const user = await User.findOne({email});
    if(user && (await bcrypt.compare(password, user.password))) {
        const accessToken = jwt.sign({
            user: {
                username: user.username,
                email: user.email,
                id: user.id
            },
        }, 
        process.env.JWT_SECRET, 
        {expiresIn: '15m'}
        );
        res.status(200).json({ accessToken })
    } else {
        res.status(400);
        throw new Error('Invalid credentials');
    }
    res.json({
       message: 'Login the user'
   });
});

//@desc Get current user info
//@route GET /api/users/current
//@access private
const currentUser = asyncHandler(async (req, res) => {
   res.json(req.user);
});

module.exports = {
    registerUser,
    loginUser,
    currentUser
}
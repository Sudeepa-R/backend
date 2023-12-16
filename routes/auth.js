const express = require('express');
const User = require('../models/User');
const router = express.Router();
const { body, validationResult } = require('express-validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');
const fetchuser = require('../middleware/fetchuser');
const JWT_SECRET = 'abuisagoodboy';



//Route1
// creating user : POST '/api/auth/createuser' , no login requried 

router.post('/createuser', [
    body('name', 'Enter valid name').isLength({ min: 5 }),
    body('email', 'Enter valid email').isEmail(),
    body('password', 'Password must be atleast 8 characters').isLength({ min: 8 }),
], async (req, res) => {
    let success = false;
    //if error occures give bad request and error message
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success, errors: errors.array() })
    }

    try {
        // chec user already exist or not
        let user = await User.findOne({ email: req.body.email });
        if (user) {
            return res.status(400).json({ success, error: 'sorry this Email already exists' })
        }

        //securing password using bcrypt package (this converts password string into hash characters)

        const salt = await bcrypt.genSalt(10);//salt is adding some extra hashes to a password
        const secPass = await bcrypt.hash(req.body.password, salt)


        //creating user
        user = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: secPass,
        })


        //jwt tokens (is used to retrive specific userdata using the token)
        const data = {
            user: {
                id: user.id //when ever user gives us to given token , we give this id (means id represent user data)
            }
        }
        const authtoken = jwt.sign(data, JWT_SECRET)
        success = true;
        res.json({ success ,authtoken })
        // res.json(user)

    }
    catch (error) {
        console.error(error.message);
        res.status(500).send('internal server error')
    }
})


//Route2
// Authenticate user : POST '/api/auth/login' , no login requried 

router.post('/login', [
    body('email', 'Enter valid email').isEmail(),
    body('password', 'Password cannot be blank').exists(),
], async (req, res) => {
    let success = false;
    //if error occures give bad request and error message
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success, errors: errors.array() })
    }

    const { email, password } = req.body //destructing method
    try {
        // finds user and checks user is entering details are correct or not
        let user = await User.findOne({ email })

        //if not coorect gives bad request and error msg
        if (!user) {
            return res.status(400).json({ success, msg: 'Please enter valid information' });
        }

        //it checks entered passwoed and user password is matching or not
        const passwordCmpare = await bcrypt.compare(password, user.password)

        //if password not matched gives bad request and error msg
        if (!passwordCmpare) {
            return res.status(400).json({
                success,
                msg: 'Please enter valid information'
            })
        }

        //if password matched then it give these output
        const data = {
            user: {
                id: user.id
            }
        }
        const authtoken = jwt.sign(data, JWT_SECRET)
        success = true;
        res.json({success, authtoken })
    }
    catch (error) {
        console.error(error.message);
        res.status(500).send('internal server error')
    }
})

//Route3
// Get loggedin user : POST '/api/auth/getuser' , login requried 

router.post('/getuser', fetchuser, async (req, res) => {

    try {
        let userId = req.user.id;
        const user = await User.findById(userId).select('-password')
        res.send(user)
    }
    catch (error) {
        console.error(error.message);
        res.status(500).send('internal server error')
    }
})

module.exports = router

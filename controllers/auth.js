const User = require('../models/User');
const bcrypt = require('bcryptjs');

//@desc Register user
//@route POST /api/v1/auth/register
//@access Public
exports.register = async (req, res, next) => {
    try {
        const { name, email, password, role, tel } = req.body;
        const user = await User.create({ name, email, password, role, tel });
        // const token = user.getSignedJwtToken();
        // res.status(200).json({ success: true, token });
        sendTokenResponse(user, 200, res);
    } catch (err) {
        res.status(400).json({ success: false });
        console.log(err.stack);
    }

}

//@desc Login user
//@route POST /api/v1/auth/register
//@access Public
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ success: false });
        }
        const user = await User.findOne(({ email })).select('+password');
        if (!user) {
            res.status(401).json({ success: false, msg: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            res.status(401).json({ success: false, msg: 'Invalid credentials' });
        }

        // const token = user.getSignedJwtToken();
        // res.status(200).json({ success: true, token });

        sendTokenResponse(user, 200, res);
    }
    catch (e) {
        return res.status(401).json({ success: false, msg: 'Cannot convert email or password to string' })
    }
}

const sendTokenResponse = (user, statusCode, res) => {
    const token = user.getSignedJwtToken();
    const options = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
        httpOnly: true
    };
    if (process.env.NODE_ENV === 'production') {
        options.secure = true;
    }
    res.status(statusCode).cookie('token', token, options).json({ success: true, token });
}

//@desc Get current logged in user
//@route POST /api/v1/auth/me
//@access Private
exports.getMe = async (req, res, next) => {
    const user = await User.findById(req.user.id);
    res.status(200).json({ success: true, data: user });
}

//@desc Log user out / clear cookie
//@route GET /api/v1/auth/logout
//@access Private
exports.logout = async (req, res, next) => {
    res.cookie('token', 'none', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });
    res.status(200).json({
        success: true,
        data: {}
    });
}
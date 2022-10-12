const express = require("express");
const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const ExpressError = require("../expressError");
const User = require("../models/user");

const router = new express.Router();

/** POST /login - login: {username, password} => {token}
 *
 * Make sure to update their last-login!
 *
 **/
router.post('/login', async function (req, res, next) {
    try {
        const { username, password } = req.body;
        if (await User.authenticate(username, password)) {
            await User.updateLoginTimestamp(username);
            const token = jwt.sign({ username }, SECRET_KEY);
            return res.json({ token });
        }
        throw new ExpressError("Invalid login credentials", 400);
    }
    catch (e) {
        return next(e);
    }
});

/** POST /register - register user: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 *
 *  Make sure to update their last-login!
 */
router.post('/register', async function (req, res, next) {
    try {
        const { username, password, first_name, last_name, phone } = req.body;
        const user = await User.register({ username, password, first_name, last_name, phone });
        const token = jwt.sign({ username: user.username }, SECRET_KEY);
        return res.json({ token });
    }
    catch (e) {
        return next(e);
    }
});


module.exports = router;
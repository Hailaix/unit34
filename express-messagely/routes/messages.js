const express = require("express");
const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const { ensureLoggedIn } = require("../middleware/auth");
const Message = require("../models/message");

const router = new express.Router();

/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Make sure that the currently-logged-in users is either the to or from user.
 *
 **/
router.get('/:id', ensureLoggedIn, async function (req, res, next) {
    try {
        const { id } = req.params;
        const message = Message.get(id);
        if (message.to_user.username !== req.user.username
            && message.from_user.username !== req.user.username) {
            throw new ExpressError("Unauthorized access", 401);
        }
        return res.json({ message });
    }
    catch (e) {
        return next(e);
    }
});

/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/
router.post('/', ensureLoggedIn, async function (req, res, next) {
    try {
        const { to_username, body } = req.body;
        const message = await Message.create({
            from_username: req.user.username,
            to_username,
            body
        });
        return res.json({ message });
    }
    catch (e) {
        return next(e);
    }
});

/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Make sure that the only the intended recipient can mark as read.
 *
 **/
router.post('/:id/read', ensureLoggedIn, async function (req, res, next) {
    try {
        const { id } = req.params;
        //get the message to authenicate logged in user as recipient
        const msg = await Message.get(id);
        if (msg.to_username === req.user.username) {
            const message = await Message.markRead(id);
            return res.json({ message });
        }
        throw new ExpressError("Unauthorized access", 401);
    }
    catch (e) {
        return next(e);
    }
});

module.exports = router;
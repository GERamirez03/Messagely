/** User routes for Messagely */

const express = require("express");
const router = new express.Router();
const User = require("../models/user");
const { ensureLoggedIn, ensureCorrectUser } = require("../middleware/auth");

/** GET / - get list of users. LOGGED IN USERS ONLY!
 *
 * => {users: [{username, first_name, last_name, phone}, ...]}
 *
 **/

router.get("/", ensureLoggedIn, async function(req, res, next) {
    try {
        // ensureLoggedIn already checked that user is logged in
        const users = await User.all();
        return res.json({ users });
    } catch (err) {
        return next(err);
    }
});


/** GET /:username - get detail of users. ONLY *THAT* USER!
 *
 * => {user: {username, first_name, last_name, phone, join_at, last_login_at}}
 *
 **/

router.get("/:username", ensureCorrectUser, async function(req, res, next) {
    try {
        // ensureCorrectUser already checked that the correct user is here
        const user = await User.get(req.params.username);
        return res.json({ user });
    } catch (err) {
        return next(err);
    }
});


/** GET /:username/to - get messages to user. ONLY *THAT* USER!
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 from_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/

router.get("/:username/to", ensureCorrectUser, async function(req, res, next) {
    try {
        // ensureCorrectUser already checked that the correct user is here
        const messages = await User.messagesTo(req.params.username);
        return res.json({ messages });
    } catch (err) {
        return next(err);
    }
});


/** GET /:username/from - get messages from user. ONLY *THAT* USER!
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 to_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/

router.get("/:username/from", ensureCorrectUser, async function(req, res, next) {
    try {
        // ensureCorrectUser already checked that the correct user is here
        const messages = await User.messagesFrom(req.params.username);
        return res.json({ messages });
    } catch (err) {
        return next(err);
    }
});

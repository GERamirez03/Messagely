/** Message routes for Messagely */

const express = require("express");
const router = new express.Router();
const Message = require("../models/message");
const { ensureLoggedIn } = require("../middleware/auth");

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

router.post("/:id", ensureLoggedIn, async function(req, res, next) {
    try {
        const id = req.params.id;
        const message = await Message.get(id);
        if ( req.user.username === message.to_user.username 
            || req.user.username === message.from_user.username ) {
            return res.json({ message });
        } else {
            return next({ status: 401, message: "Unauthorized" });
        }
    } catch (err) {
        return next(err);
    }
});


/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/

router.post("/", ensureLoggedIn, async function(req, res, next) {
    try {
        // ensureLoggedIn already checked that user is logged in
        req.body.from_username = req.user.username;
        const message = await Message.create(req.body);
        return res.json({ message });
    } catch (err) {
        return next(err);
    }
});


/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Make sure that the only the intended recipient can mark as read.
 *
 **/

router.post("/:id/read", ensureLoggedIn, async function(req, res, next) {
    try {
        // ensureLoggedIn already checked that user is logged in
        // check that user is recipient:
        const id = req.params.id;
        const message = await Message.get(id);
        if (req.user.username === message.to_user.username) {
            const result = await Message.markRead(id);
            return res.json({ message: result });
        } else {
            return next({ status: 401, message: "Unauthorized" });
        }
    } catch (err) {
        return next(err);
    }
});

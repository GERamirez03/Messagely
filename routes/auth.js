/** Authorizaiton routes for Messagely */

const express = require("express");
const router = new express.Router();
const ExpressError = require("../expressError");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");

/** POST /login - login: {username, password} => {token}
 *
 * Make sure to update their last-login!
 *
 **/

router.post("/login", async function(req, res, next) {
    try {
        const { username, password } = req.body;
        if (await User.authenticate(username, password)) {
            const token = jwt.sign({ username }, SECRET_KEY);
            return res.json({ token });
        }
        throw new ExpressError("Invalid credentials", 400);
    } catch (err) {
        return next(err);
    }
});


/** POST /register - register user: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 *
 *  Make sure to update their last-login!
 */

router.post("/register", async function(req, res, next) {
    try {
        const user = await User.register(req.body);
        const username = user.username;
        const payload = { username };
        const token = jwt.sign(payload, SECRET_KEY);
        return res.json({ token });
    } catch (err) {
        return next(err);
    }
});

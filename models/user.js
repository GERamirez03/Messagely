/** User class for message.ly */

const bcrypt = require("bcrypt");
const db = require("../db");
const ExpressError = require("../expressError");
const { BCRYPT_WORK_FACTOR } = require("../config");



/** User of the site. */

class User {

  /** register new user -- returns
   *    {username, password, first_name, last_name, phone}
   */

  static async register({username, password, first_name, last_name, phone}) {

      const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

      const result = await db.query(`
        INSERT INTO users (username, password, first_name, last_name, phone, join_at, last_login_at)
        VALUES ($1, $2, $3, $4, $5, current_timestamp, current_timestamp)
        RETURNING username, password, first_name, last_name, phone`,
        [username, hashedPassword, first_name, last_name, phone]);

      return result.rows[0];
   }

  /** Authenticate: is this username/password valid? Returns boolean. */

  static async authenticate(username, password) {

      const result = await db.query(`
        SELECT password FROM users WHERE username=$1`,
        [username]);
      const user = result.rows[0];

      if (user) {
        if (await bcrypt.compare(password, user.password)) {
          return true;
        }
      }
      return false;
   }

  /** Update last_login_at for user */

  static async updateLoginTimestamp(username) {

    const result = await db.query(`
      UPDATE users 
      SET last_login_at = current_timestamp
      WHERE username=$1
      RETURNING username, last_login_at`,
      [username]);

    if (!result.rows[0]) {
      throw new ExpressError(`User not found: ${username}`, 404);
    }

    return result.rows[0];
   }

  /** All: basic info on all users:
   * [{username, first_name, last_name, phone}, ...] */

  static async all() {

    const results = await db.query(`
      SELECT username, first_name, last_name, phone
      FROM users`);

      return results.rows;
   }

  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */

  static async get(username) {

    const result = await db.query(`
      SELECT username, first_name, last_name, phone, join_at, last_login_at
      FROM users 
      WHERE username=$1`,
      [username]);

      if (!result.rows[0]) {
        throw new ExpressError(`User not found: ${username}`, 404);
      }
  
      return result.rows[0];
   }

  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(username) {

    const results = await db.query(`
      SELECT id, to_username, body, sent_at, read_at
      FROM messages
      WHERE from_username=$1`,
      [username]);

      // map to_username to to_user: {username, first_name, last_name, phone}
      const returnObject = results.rows.map( async row => {

        // first, get the user row/details for the user receiving the message
        const toUsername = row.to_username;
        const toUser = await db.query(`
          SELECT username, first_name, last_name, phone
          FROM users
          WHERE username=$1`,
          [toUsername]);

        // then, replace the to_username of each message with the toUser object
        const updatedRow = row;
        delete updatedRow.to_username;
        updatedRow.to_user = toUser;

        return updatedRow;
      });

    return returnObject;
   }

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesTo(username) {

    const results = await db.query(`
      SELECT id, from_username, body, sent_at, read_at
      FROM messages
      WHERE to_username=$1`,
      [username]);

      // map from_username to from_user: {username, first_name, last_name, phone}
      const returnObject = results.rows.map( async row => {

        // first, get the user row/details for the user sending the message
        const fromUsername = row.from_username;
        const fromUser = await db.query(`
          SELECT username, first_name, last_name, phone
          FROM users
          WHERE username=$1`,
          [fromUsername]);

        // then, replace the from_username of each message with the fromUser object
        const updatedRow = row;
        delete updatedRow.from_username;
        updatedRow.from_user = fromUser;

        return updatedRow;
      });

    return returnObject;}
}


module.exports = User;
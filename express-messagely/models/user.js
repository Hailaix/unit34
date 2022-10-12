/** User class for message.ly */
const db = require('../db');
const ExpressError = require("../expressError");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { SECRET_KEY, BCRYPT_WORK_FACTOR } = require('../config');

/** User of the site. */

class User {

  /** register new user -- returns
   *    {username, password, first_name, last_name, phone}
   */

  static async register({ username, password, first_name, last_name, phone }) {
    const hashpwd = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);
    const result = await db.query(
      `INSERT INTO users (username, password, first_name, last_name, phone, join_at, last_login_at)
      VALUES ($1, $2, $3, $4, $5, current_timestamp, current_timestamp)
      RETURNING username, password, first_name, last_name, phone
      `, [username, hashpwd, first_name, last_name, phone]);
    return result.rows[0];
  }

  /** Authenticate: is this username/password valid? Returns boolean. */

  static async authenticate(username, password) {
    //get the hashed password stored in the db.
    const result = await db.query(`SELECT password FROM users WHERE username = $1`, [username]);
    let hashpwd = result.rows[0];

    if (hashpwd) {
      return await bcrypt.compare(password, hashpwd.password);
    }
    throw new ExpressError("Invalid username/password", 400);
  }

  /** Update last_login_at for user */

  static async updateLoginTimestamp(username) {
    const result = await db.query(
      `UPDATE users
         SET last_login_at = current_timestamp
         WHERE username = $1
         RETURNING username, last_login_at`,
      [username]);

    if (!result.rows[0]) {
      throw new ExpressError(`No such user: ${username}`, 404);
    }

    return result.rows[0];
  }

  /** All: basic info on all users:
   * [{username, first_name, last_name, phone}, ...] */

  static async all() {
    const results = await db.query(`SELECT username, first_name, last_name, phone FROM users`);
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
    WHERE username = $1
    `, [username]);
    const user = result.rows[0];
    if (user) {
      return user;
    }
    else {
      throw new ExpressError(`No such user: ${username}`, 404);
    }
  }

  /** Return messages from this user.
   *
   * [{id, to_user body, sent_at, read_at}]
   *
   * where from_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(username) {
    const results = await db.query(`
    SELECT m.id,
    m.to_username,
    t.first_name AS to_first_name,
    t.last_name AS to_last_name,
    t.phone AS to_phone,
    m.body,
    m.sent_at,
    m.read_at
    FROM messages AS m
    JOIN users AS t ON m.to_username = t.username
    WHERE m.from_username = $1`, [username]);

    //if there are no messages, will just return an empty array (even if username is not valid)
    const messages = results.rows.map(m => {
      return {
        id: m.id,
        to_user: {
          username: m.to_username,
          first_name: m.to_first_name,
          last_name: m.to_last_name,
          phone: m.to_phone,
        },
        body: m.body,
        sent_at: m.sent_at,
        read_at: m.read_at,
      };
    });
    return messages;
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
    SELECT m.id,
    m.from_username,
    f.first_name AS from_first_name,
    f.last_name AS from_last_name,
    f.phone AS from_phone,
    m.body,
    m.sent_at,
    m.read_at
    FROM messages AS m
    JOIN users AS f ON m.from_username = f.username
    WHERE m.to_username = $1`, [username]);

    //if there are no messages, will just return an empty array (even if username is not valid)
    const messages = results.rows.map(m => {
      return {
        id: m.id,
        from_user: {
          username: m.from_username,
          first_name: m.from_first_name,
          last_name: m.from_last_name,
          phone: m.from_phone,
        },
        body: m.body,
        sent_at: m.sent_at,
        read_at: m.read_at,
      };
    });
    return messages;
  }
}


module.exports = User;
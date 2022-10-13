const request = require("supertest");

const app = require("../app");
const db = require("../db");

const Book = require("../models/book");

const bookData = {
    "isbn": "0691161518",
    "amazon_url": "http://a.co/eobPtX2",
    "author": "Matthew Lane",
    "language": "english",
    "pages": 264,
    "publisher": "Princeton University Press",
    "title": "Power-Up: Unlocking the Hidden Mathematics in Video Games",
    "year": 2017
};

beforeEach(async function () {
    // make a book to test
    await Book.create(bookData);
});

afterEach(async function () {
    // empty the db
    await db.query("DELETE FROM BOOKS")
});

afterAll(async function () {
    // close the db connection
    await db.end();
});

describe("GET /books", function () {
    test("get the list of books in the database", async function() {
        const resp = await request(app).get('/books');
        expect(resp.statusCode).toBe(200);
        expect(resp.body.books.length).toBe(1);
    });
});

describe("POST /books", function () {
    test("creating a new book", async function(){

    });
    test("400 on schema mismatch", async function(){

    });
    test("500 on duplicate isbn", async function(){

    });
});

describe("GET /books/:isbn", function () {
    test("get a single book", async function (){

    });
    test("404 on incorrect isbn", async function(){

    });
});

describe("PUT /books/:isbn", function () {
    test("update a single book", async function (){

    });
    test("404 on incorrect isbn", async function(){

    });
});

describe("DELETE /books/:isbn", function () {

});
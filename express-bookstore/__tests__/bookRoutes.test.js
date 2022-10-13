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
    test("get the list of books in the database", async function () {
        const resp = await request(app).get('/books');
        expect(resp.statusCode).toBe(200);
        expect(resp.body.books.length).toBe(1);
    });
});

describe("POST /books", function () {
    test("creating a new book", async function () {
        const newbookData = {
            "isbn": "1234",
            "amazon_url": "http://a.co/",
            "author": "Me",
            "language": "english",
            "pages": 1,
            "publisher": "Myself",
            "title": "Test book",
            "year": 2022
        };
        const resp = await request(app).post('/books').send(newbookData);
        expect(resp.statusCode).toBe(201);
        expect(resp.body.book.isbn).toEqual("1234");
    });
    test("400 on schema mismatch", async function () {
        const resp = await request(app).post('/books');
        expect(resp.statusCode).toBe(400);
    });
    test("500 on duplicate isbn", async function () {
        const resp = await request(app).post('/books').send(bookData);
        expect(resp.statusCode).toBe(500);
    });
});

describe("GET /books/:isbn", function () {
    test("get a single book", async function () {
        const resp = await request(app).get(`/books/${bookData.isbn}`);
        expect(resp.statusCode).toBe(200);
        expect(resp.body.book.isbn).toEqual(bookData.isbn);
        expect(resp.body.book.title).toEqual(bookData.title);
    });
    test("404 on incorrect isbn", async function () {
        const resp = await request(app).get(`/books/invalidisbn`);
        expect(resp.statusCode).toBe(404);
    });
});

describe("PUT /books/:isbn", function () {
    test("update a single book", async function () {
        const bookUpdate = {
            "amazon_url": "http://a.co/",
            "author": "Me",
            "language": "english",
            "pages": 1,
            "publisher": "Myself",
            "title": "Test book",
            "year": 2022
        };
        const resp = await request(app).put(`/books/${bookData.isbn}`).send(bookUpdate);
        expect(resp.statusCode).toBe(200);
        expect(resp.body.book.isbn).toEqual(bookData.isbn);
        expect(resp.body.book.title).toEqual(bookUpdate.title);
    });
    test("400 on schema mismatch", async function () {
        const resp = await request(app).put(`/books/${bookData.isbn}`);
        expect(resp.statusCode).toBe(400);
    });
    test("404 on incorrect isbn", async function () {
        const resp = await request(app).put(`/books/invalidisbn`).send(bookData);
        expect(resp.statusCode).toBe(404);
    });
});

describe("DELETE /books/:isbn", function () {
    test("delete a single book", async function () {
        const resp = await request(app).delete(`/books/${bookData.isbn}`);
        expect(resp.statusCode).toBe(200);
        expect(resp.body).toEqual({ message: "Book deleted" });
    });
    test("404 on incorrect isbn", async function () {
        const resp = await request(app).delete(`/books/invalidisbn`);
        expect(resp.statusCode).toBe(404);
    });
});
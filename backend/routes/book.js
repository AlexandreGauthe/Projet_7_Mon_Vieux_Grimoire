const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');
const booksCtlr = require('../controllers/book');

router.post('/', auth, multer, booksCtlr.addBook);
router.get('/', booksCtlr.showAllBooks);
router.get('/:id', booksCtlr.showOneBook);

module.exports = router;
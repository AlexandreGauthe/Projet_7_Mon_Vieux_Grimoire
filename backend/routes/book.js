const express = require('express');
const auth = require('../middleware/auth');
const router = express.Router();
const multer = require('../middleware/multer-config');
const booksCtlr = require('../controllers/book');


router.post('/', auth, multer, booksCtlr.addBook);
router.get('/', booksCtlr.showAllBooks);
router.get('/:id/ratings',booksCtlr.getBookRatings);
router.get('/bestrating', booksCtlr.getBestRatedBooks);
router.post('/:id/rating', auth, booksCtlr.rateBook);
router.get('/:id', booksCtlr.showOneBook);
router.put('/:id', auth, multer, booksCtlr.modifyBook);
router.delete('/:id', auth, multer, booksCtlr.deleteBook);
module.exports = router;
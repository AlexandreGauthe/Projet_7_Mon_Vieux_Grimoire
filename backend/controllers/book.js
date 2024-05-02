const multer = require('multer');
const sharp = require('../functions/sharpResize');
const Book = require('../models/Book')
const fs = require('fs');
const hasUserAlreadyRated = require('../functions/ratedCheck');
const updateAverageRating = require('../functions/averageCalculation');

exports.showAllBooks = (req, res, next) => {
    Book.find()
        .then(books => res.status(200).json(books))
        .catch(error => res.status(400).json({ error }));
    };

  exports.showOneBook = (req, res, next) => {
    Book.findOne({_id: req.params.id})
        .then(book => res.status(200).json( book ))
        .catch(error => res.status(400).json({ error }));
  };

  exports.addBook = (req, res, next) => {
    const bookObject = JSON.parse(req.body.book)
    delete bookObject._id;
    delete bookObject._userId;
    const bookImage = sharp.resizeImage(req.file)
    const book = new Book({
        ...bookObject,
        userId: req.auth.userId,
        imageUrl:`${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });

    book.save()
        .then(() => { res.status(201).json({ message: 'Livre ajouté !'})})
        .catch(error => { res.status(400).json({ error })});
  };
  
  exports.getBookRatings = (req, res, next) => {
    Book.findOne({ _id: req.params.id })
      .then ((book) => { res.status(200).json(book.ratings)})
      .catch(error => { res.status(400).json({ error })});
      next();
  }

  exports.rateBook = async (req, res, next) => {
  try {
    
    const ratingObject = { ...req.body, grade: req.body.rating };
    delete ratingObject.rating;

    const book = await Book.findOne({ _id: req.params.id });
    const userRating = hasUserAlreadyRated(req.body.userId, book.ratings);

  
    if (userRating) {
      return res.status(422).json({ message: 'Vous avez déjà noté ce livre' });
    }

    const averageRatingValue = updateAverageRating(book, ratingObject);
    await Book.updateOne(
      { _id: req.params.id },
      { $push: { ratings: ratingObject }, averageRating: averageRatingValue }
    );

    const updatedBook = await Book.findOne({ _id: req.params.id });
    res.status(200).json(updatedBook);
  } catch (error) {
    next(error);
  }
};

  exports.getBestRatedBooks = (req, res, next) => {
    Book.find().sort({ averageRating: -1 }).limit(3)
    .then((books) => { res.status(200).json(books)})
    .catch(error => { res.status(400).json({ error })});
    };

 exports.modifyBook= (req, res, next) => {
  const bookObject = req.file ? {
      ...JSON.parse(req.body.book),
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
      
  } : { ...req.body };

  delete bookObject._userId;

  Book.findOne({_id: req.params.id})
      .then((book) => {
          if (book.userId != req.auth.userId) {
              res.status(401).json({ message : 'Not authorized'});
          } else {
              Book.updateOne({ _id: req.params.id}, { ...bookObject, _id: req.params.id})
              .then(() => res.status(200).json({message : 'Objet modifié!'}))
              .catch(error => res.status(401).json({ error }));
          }
      })
      .catch((error) => {
          res.status(400).json({ error });
      });
};

  exports.deleteBook = (req, res, next) => {
    Book.findOne({_id: req.params.id})
      .then(book => {
        if (book.userId != req.auth.userId){
          res.status(401).json({ message: 'Not authorized'});
        } else {
          const filename = book.imageUrl.split('/images/')[1];
          fs.unlink(`images/${filename}`,() => {
            Book.deleteOne({ _id: req.params.id })
        .then(() => res.status(200).json({ message: 'Livre supprimé !'}))
        .catch(error => res.status(400).json({ error }));
          });
        }
      })
    .catch( error => {
      res.status(500).json({ error });
    });
  };
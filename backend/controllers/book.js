const multer = require('multer');
const sharp = require('../functions/sharpResize');
const Book = require('../models/Book')
const fs = require('fs');
const hasUserAlreadyRated = require('../functions/ratedCheck');
const updateAverageRating = require('../functions/averageCalculation');

// Contrôleur pour récuperer tout les livres//
exports.showAllBooks = (req, res, next) => {
    Book.find()
        .then(books => res.status(200).json(books))
        .catch(error => res.status(400).json({ error }));
    };
// Contrôleur pour récuperer un livre avec son Id//
  exports.showOneBook = (req, res, next) => {
    Book.findOne({_id: req.params.id})
        .then(book => res.status(200).json( book ))
        .catch(error => res.status(400).json({ error }));
  };

  //Contrôleur pour ajouter un livre//
  exports.addBook = async (req, res, next) => {
    try {
      const bookObject = JSON.parse(req.body.book);
      const filename = await sharp.resizeImage(req.file);
      const originalImage = `${req.protocol}://${req.get('host')}/${filename}`;
      const imageUrl = originalImage.replace(/\\/g,"/"); 
      delete bookObject._id;
      delete bookObject._userID;
      const book = new Book({
        ...bookObject,
        userId: req.auth.userId, 
        imageUrl,
      });
      await book.save();
      res.status(201).json({ message: 'Livre ajouté !' });
    } catch (error) {
      next(error);
    }
  };
  
  //Contrôleur pour récuperer les notres d'un livre //
  exports.getBookRatings = (req, res, next) => {
    Book.findOne({ _id: req.params.id })
      .then ((book) => { res.status(200).json(book.ratings)})
      .catch(error => { res.status(400).json({ error })});
      next();
  }

  //Contrôleur pour ajouter la note d'un livre //
  exports.rateBook = (req, res, next) => {
    const ratingObject = { ...req.body, grade: req.body.rating };
    delete ratingObject.rating;
    Book.findOne({ _id: req.params.id })
      .then ((book) => {
        const userRating = hasUserAlreadyRated(req.body.userId, book.ratings);
        if (userRating) {
          return res.status(422).json({ message: 'Vous avez déjà noté ce livre' });
        }
        const averageRatingValue = updateAverageRating(book, ratingObject);
        Book.updateOne(
            { _id: req.params.id },
            { $push: { ratings: ratingObject }, averageRating: averageRatingValue }
          )
          .then((book) =>{ 
            Book.findOne({ _id: req.params.id })
            .then ((book) => { res.status(200).json(book)})
            .catch(error => { res.status(400).json({ error })});
          })
        .catch(error => {res.status(500).json({error})})
        })
    .catch(error => { res.status(400).json({ error })});
  };
  
  //Contrôleur pour récuperer les 3 livres les mieux notés//
  exports.getBestRatedBooks = (req, res, next) => {
    Book.find().sort({ averageRating: -1 }).limit(3)
    .then((books) => { res.status(200).json(books)})
    .catch(error => { res.status(400).json({ error })});
    };
 
  //Contrôleur pour la modification du livre
  exports.modifyBook = async (req, res, next) => {
    try {
      let filename;
      if (req.file) filename = await sharp.resizeImage(req.file);
      const bookObject = req.file
        ? {
            ...JSON.parse(req.body.book),
            imageUrl: `${req.protocol}://${req.get('host')}/${filename}`,
          }
        : { ...req.body };

      delete bookObject._userId;
      const book = await Book.findOne({ _id: req.params.id });
      if (book.userId != req.auth.userId) {
        return res.status(401).json({ message: 'Non autorisé' });
      }
      if (req.file && book.imageUrl) {
        const filename = book.imageUrl.split('/images/')[1];
        fs.unlink(`images/${filename}`, (err) => {
          if (err) console.log(err);
        });
      }
      await Book.updateOne({ _id: req.params.id }, { ...bookObject });
      res.status(200).json({ message: 'Livre modifié !' });
      } catch (error) {
      next(error);
    }
  };

  //Contrôlleur pour effacer un livre//
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
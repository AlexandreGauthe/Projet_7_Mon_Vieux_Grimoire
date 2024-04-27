const Book = require('../models/Book')

exports.addBook = (req, res, next) => {
    const book = new Book({
        ...req.body
    });
    book.save()
        .then(() => res.status(201).json({ message: 'Livre ajouté ! '}))
        .catch(error => res.status(400).json({ error }));
};

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
    const book = new Book({
        ...bookObject,
        userId: req.auth.userId,
        imageUrl:`${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });
    book.save()
        .then(() => res.status(201).json({ mesage: 'Livre ajouté !'}))
        .catch(error => res.status(400).json({ error }));
  };
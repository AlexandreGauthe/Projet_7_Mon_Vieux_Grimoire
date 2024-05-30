//Fonction pour calculer la note moyenne d'un livre //

function updateAverageRating(book, ratingObject) {
    const ratingsLength = book.ratings.length;
    const currentAverage = book.averageRating || 0;
    const newGrade = ratingObject.grade;
    const updatedAverage = (currentAverage * ratingsLength + newGrade) / (ratingsLength + 1);
     return Math.round(updatedAverage * 10) / 10;
}

module.exports = updateAverageRating;
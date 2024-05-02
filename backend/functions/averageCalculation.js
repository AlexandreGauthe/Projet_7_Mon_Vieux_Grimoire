function updateAverageRating(book, ratingObject) {
    const n = book.ratings.length;
    const currentAverage = book.averageRating || 0;
    const newGrade = ratingObject.grade;
    const updatedAverage = (currentAverage * n + newGrade) / (n + 1);
     return Math.round(updatedAverage * 10) / 10;
}

module.exports = updateAverageRating;
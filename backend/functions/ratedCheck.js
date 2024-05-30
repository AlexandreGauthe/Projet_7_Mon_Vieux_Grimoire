//Fonction pour verifier si un utilisateur à déja noté un livre //
function hasUserAlreadyRated(userId, ratings) {
    for (let i = 0; i < ratings.length; i++) {
       if (ratings[i].userId === userId) {
            return true;
        }
    }
    return false;
}
module.exports = hasUserAlreadyRated;
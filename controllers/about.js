/**
 * GET /
 */
exports.contactGet  = function(req, res) {
    res.render('about', {
        title: 'About'
    });
};

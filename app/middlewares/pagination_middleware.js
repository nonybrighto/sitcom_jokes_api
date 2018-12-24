module.exports = (req, res, next) => {

    let page = parseInt(req.query.page, 10);
    if (isNaN(page) || page < 1) {
      page = 1;
    }
    
    let perPage = parseInt(req.query.per_page, 10);
    if (isNaN(perPage)) {
      perPage = 10;
    } else if (perPage > 50) {
      perPage = 50;
    } else if (perPage < 1) {
      perPage = 1;
    }

    req.query.page = page;
    req.query.perPage = perPage;

    next();
}
const router = function(app){

    const v1 = '/api/v1';
  
    const users = require('../routes/users');
    const user = require('../routes/user');
    const jokes = require('../routes/jokes');
    const auth = require('../routes/auth');
    const movies = require('../routes/movies');
    //   var auth = require('../routes/auth.route');
    //   var countries = require('../routes/country.route');
   
      app.use(v1+'/auth',auth);
      app.use(v1+'/users', users);
      app.use(v1+'/user', user);
      app.use(v1+'/jokes', jokes);
      app.use(v1+'/movies', movies);
  };
  
  module.exports = router;   
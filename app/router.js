var router = function(app){

    var v1 = '/api/v1';
  
    var users = require('../routes/users');
    const auth = require('../routes/auth');
    //   var auth = require('../routes/auth.route');
    //   var countries = require('../routes/country.route');
   
      //TODO: remember to add /api/v1 when testing the rest API
      app.use(v1+'/auth',auth);
      app.use(v1+'/users', users);
  };
  
  module.exports = router;   
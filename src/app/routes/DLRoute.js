

module.exports = function(app){
    const processed_photo = require('../controllers/DLController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');

   //let multers =processed_photo.upload.fields([{name:'photo', maxCount:1},{name:'graph', maxCount:1}]);
   let multer1=processed_photo.upload.single('img')
    
    app.route('/app/poohinfo').post(multer1,processed_photo.newPoohInfo);

};


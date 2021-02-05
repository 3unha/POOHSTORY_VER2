module.exports = function(app){
    const doctor = require('../controllers/doctorController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');

    app.get('/app/poohlist',jwtMiddleware,doctor.getPoohList);
    app.get('/app/poohinfo/:pooh_info_idx',jwtMiddleware,doctor.getPoohInfo);
    app.route('/app/newopinion/:pooh_info_idx').post(jwtMiddleware,doctor.newOpinion);
    app.get('/app/pastopinion/:pooh_info_idx',jwtMiddleware,doctor.getPastOpinion);

};

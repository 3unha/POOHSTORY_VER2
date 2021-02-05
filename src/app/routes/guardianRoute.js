const { post } = require('request');

module.exports = function(app){
    const guardian = require('../controllers/guardianController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');

    // app.get('/app/board', jwtMiddleware, board.selectBoard);
    app.route('/app/doctorinfo').post(jwtMiddleware,guardian.getDoctorInfo);
    app.route('/app/booking').post(jwtMiddleware,guardian.newBooking);
    //소견 조회
    app.get('/app/opinions',jwtMiddleware,guardian.getOpinionList);

    //소견 상세 조회
    app.get('/app/opinion/:opinion_idx',jwtMiddleware,guardian.getDetailOpinion);

    //딥러닝에 필요한 부분
    app.get('/app/base',jwtMiddleware,guardian.getBasicInfo);

};



module.exports = function(app){
    const user = require('../controllers/userController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');

    let _multer=user.upload.single('profile');
   // app.route('/app/signUp').post(user.signUp);
    //의사 회원가입
    app.route('/app/doctorSignUp').post(_multer,user.DsignUp);

    //보호자 회원가입
    app.route('/app/guardianSignUp').post(user.GsignUp);

    //아기 회원가입
    //app.route('/app/babySignUp').post(user.BsignUp);

    //id중복확인
    app.route('/app/id-check').post(user.idCheck);

    //로그인
    app.route('/app/signIn').post(user.signIn);

    //아이디 찾기
    //app.get('/app/findId',user.findId);

    //비밀번호 변경
    //app.get('/app/findPassword',user.findPassword);

    //병원 3개 
    app.get('/app/hospitals',user.getHospitals);

    app.get('/check', jwtMiddleware, user.check);
};
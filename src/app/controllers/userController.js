
const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');

const jwt = require('jsonwebtoken');
const regexEmail = require('regex-email');
const crypto = require('crypto');
const secret_config = require('../../../config/secret');

const userDao = require('../dao/userDao');
const { constants } = require('buffer');

const multer=require('multer');
const multerS3=require('multer-s3');
const AWS=require('aws-sdk');

AWS.config.update({
    accessKeyId:"/",
    secretAccessKey:"/",
    region: 'ap-northeast-2'
})

exports.upload =multer({
    storage: multerS3({
        s3:new AWS.S3(),
        bucket: "/",
        contentType: multerS3.AUTO_CONTENT_TYPE,
        acl:'public-read',
        key:(req,file,cb)=>{
            console.log("multer-part");
            console.log(file);
            cb(null,Date.now().toString());
        },
    }),
    //limits:{fileSize:5*1024*1024},
})



exports.idCheck = async function (req, res) {
    try {
        const {id}=req.body;
        //console.log(id);
        const idRows = await userDao.userIdCheck(id);
            if (idRows.length > 0) {

                return res.json({
                    isSuccess: false,
                    // code: 301,
                    // message: "중복된 아이디 입니다."
                });
            }

        //  await connection.commit(); // COMMIT
        // connection.release();
        return res.json({
            isSuccess: true,
            // code: 200,
            // message: "사용 가능한 아이디입니다."
        });
    } catch (err) {
        // await connection.rollback(); // ROLLBACK
        // connection.release();
        logger.error(`App - getBoard Query error\n: ${err.message}`);
        return res.status(500).send(`Error: ${err.message}`);
    }
};

exports.getHospitals = async function (req, res) {
    try {
        const hospitalRows = await userDao.getHospitalList();
            if (hospitalRows.length <1) {

                return res.json({
                    isSuccess: false,
                    code: 301,
                    message: "등록된 병원 정보가 없습니다."
                });
            }

        //  await connection.commit(); // COMMIT
        // connection.release();
        return res.json({
            isSuccess: true,
            code: 200,
            data: hospitalRows //최대 3개까지
        });
    } catch (err) {
        // await connection.rollback(); // ROLLBACK
        // connection.release();
        logger.error(`App - getBoard Query error\n: ${err.message}`);
        return res.status(500).send(`Error: ${err.message}`);
    }
};

//const reg_number=/^(0(2|3[1-3]|4[1-4]|5[1-5]|6[1-4]))-(\d{3,4})-(\d{4})$/;

exports.DsignUp = async function (req, res) {
    //의사회원가입+이미지s3넣도록 처리
    const {
        id, password, name, hospital_name, address, phone_number, hospital_number, marketing
    } = req.body;
    console.log(req.file);
    const photo_url=req.file.location;
   // if () return res.json({isSuccess: false, code: 301, message: "아이디를 입력해주세요."});


    if (!id) return res.json({isSuccess: false, code: 301, message: "아이디를 입력해주세요."});
    const idRows = await userDao.userIdCheck(id);
            if (idRows.length > 0) {

                return res.json({
                    isSuccess: false,
                    // code: 301,
                     message: "중복된 아이디 입니다."
                });
            }

    if (!password) return res.json({isSuccess: false, code: 302, message: "비밀번호를 입력해주세요."});
    if (password.length < 8 || password.length > 20) return res.json({
        isSuccess: false,
        code: 303,
        message: "비밀번호는 8~20자리를 입력해주세요."
    });

    if (!name) return res.json({isSuccess: false, code: 304, message: "이름을 입력해주세요."});
    if (name.length > 10) return res.json({
        isSuccess: false,
        code: 305,
        message: "이름은 최대 10자리를 입력해주세요."
    });

    if (!hospital_name) return res.json({isSuccess: false, code: 306, message: "병원 이름을 입력해주세요."});

    if (!address) return res.json({isSuccess: false, code: 307, message: "주소를 입력해주세요."});

    if (!phone_number) return res.json({isSuccess: false, code: 308, message: "휴대폰 번호를 입력 해주세요."});

    if (!hospital_number) return res.json({isSuccess: false, code: 309, message: "병원 번호를 입력 해주세요."});

    

    if (!marketing) return res.json({isSuccess: false, code: 310, message: "마케팅 정보 수신을 선택해주세요."});


    try {
        try {
           

            // TRANSACTION : advanced
           // await connection.beginTransaction(); // START TRANSACTION
            const hashedPassword = await crypto.createHash('sha512').update(password).digest('hex');
            const insertDoctorUserInfoParams = [id, hashedPassword, name, hospital_name, address, phone_number, hospital_number, photo_url,marketing];
            const insertDoctorUserRows = await userDao.insertDoctorUserInfo(insertDoctorUserInfoParams);

          //  await connection.commit(); // COMMIT
           // connection.release();
            return res.json({
                isSuccess: true,
                code: 200,
                message: "회원가입 성공"
            });
        } catch (err) {
           // await connection.rollback(); // ROLLBACK
           // connection.release();
            logger.error(`App - SignUp Query error\n: ${err.message}`);
            return res.status(500).send(`Error: ${err.message}`);
        }
    } catch (err) {
        logger.error(`App - SignUp DB Connection error\n: ${err.message}`);
        return res.status(500).send(`Error: ${err.message}`);
    }
};

//보호자 회원가입
const reg_birth=/^(19[0-9][0-9]|20\d{2})(0[0-9]|1[0-2])(0[1-9]|[1-2][0-9]|3[0-1])$/;

exports.GsignUp = async function (req, res) {
    const {
        id, password, guardian_name, relationship, real_guardian, phone_number, recognition_path,baby_name, weight, address, birth, gender, using_hospital, marketing
    } = req.body;


    if (!id) return res.json({isSuccess: false, code: 301, message: "아이디를 입력해주세요."});

    const idRows = await userDao.userIdCheck(id);
            if (idRows.length > 0) {

                return res.json({
                    isSuccess: false,
                    // code: 301,
                    // message: "중복된 아이디 입니다."
                });
            }

    if (!password) return res.json({isSuccess: false, code: 302, message: "비밀번호를 입력해주세요."});
    if (password.length < 8 || password.length > 20) return res.json({
        isSuccess: false,
        code: 303,
        message: "비밀번호는 8~20자리를 입력해주세요."
    });

    if (!guardian_name) return res.json({isSuccess: false, code: 304, message: "보호자의 이름을 입력해주세요."});


    if (!relationship) return res.json({isSuccess: false, code: 305, message: "아기와의 관계를 입력해주세요."});

    if (!real_guardian) return res.json({isSuccess: false, code: 306, message: "실대면 보호자를 입력해주세요."});

    if (!phone_number) return res.json({isSuccess: false, code: 307, message: "휴대폰 번호를 입력해주세요."});

    if (!recognition_path) return res.json({isSuccess: false, code: 308, message: "앱 인지경로를 입력해주세요."});

    if (!baby_name) return res.json({isSuccess: false, code: 309, message: "아기의 이름을 입력해주세요."});
    
    if (!weight) return res.json({isSuccess: false, code: 310, message: "체중을 입력해주세요."});

    if (!address) return res.json({isSuccess: false, code: 311, message: "주소를 입력해주세요."});

    if (!birth) return res.json({isSuccess: false, code: 312, message: " 생년월일을 입력해주세요."});

    if(!reg_birth.test(birth)){
        return res.json({
            isSuccess: false,
            code: 316,
            message: "생년월일을 다시 입력해주세요."
        });
    };
    
    
    if (!gender) return res.json({isSuccess: false, code: 313, message: "성별을 선택해주세요."});

    if (!using_hospital) return res.json({isSuccess: false, code: 314, message: "이용 중인 병원을 선택해주세요."});

    if (!marketing) return res.json({isSuccess: false, code: 315, message: "마케팅 정보 수신을 선택해주세요."});


    try {
        try {
            

            // TRANSACTION : advanced
           // await connection.beginTransaction(); // START TRANSACTION
            const hashedPassword = await crypto.createHash('sha512').update(password).digest('hex');
            const insertGuardianUserInfoParams = [id, hashedPassword, guardian_name, relationship, real_guardian, phone_number, recognition_path,marketing];
            
            const insertGuardianUserRows = await userDao.insertGuardianUserInfo(insertGuardianUserInfoParams);

            const insertBabyInfoParams = [id, baby_name, weight, address, birth, gender, using_hospital];
            
            const insertBabyRows = await userDao.insertBabyInfo(insertBabyInfoParams);

          //  await connection.commit(); // COMMIT
           // connection.release();
            return res.json({
                isSuccess: true,
                code: 200,
                message: "회원가입 성공"
            });
        } catch (err) {
           // await connection.rollback(); // ROLLBACK
           // connection.release();
            logger.error(`App - SignUp Query error\n: ${err.message}`);
            return res.status(500).send(`Error: ${err.message}`);
        }
    } catch (err) {
        logger.error(`App - SignUp DB Connection error\n: ${err.message}`);
        return res.status(500).send(`Error: ${err.message}`);
    }
};

//아기 정보 입력
// exports.BsignUp = async function (req, res) {
//     //보호자 id 넘겨받기

//     try {
//         try {

//             // TRANSACTION : advanced
//            // await connection.beginTransaction(); // START TRANSACTION
//            // const hashedPassword = await crypto.createHash('sha512').update(password).digest('hex');
//             const insertBabyInfoParams = [g_id, baby_name, weight, address, birth, gender, using_hospital];
            
//             const insertBabyRows = await userDao.insertBabyInfo(insertBabyInfoParams);

//           //  await connection.commit(); // COMMIT
//            // connection.release();
//             return res.json({
//                 isSuccess: true,
//                 code: 200,
//                 message: "아기정보 기입 성공"
//             });
//         } catch (err) {
//            // await connection.rollback(); // ROLLBACK
//            // connection.release();
//             logger.error(`App - SignUp Query error\n: ${err.message}`);
//             return res.status(500).send(`Error: ${err.message}`);
//         }
//     } catch (err) {
//         logger.error(`App - SignUp DB Connection error\n: ${err.message}`);
//         return res.status(500).send(`Error: ${err.message}`);
//     }
// };



 //로그인 시 의사/보호자 구분 필요
exports.signIn = async function (req, res) {
    const {
        id, password
    } = req.body;

    if (!id) return res.json({isSuccess: false, code: 301, message: "id를 입력해주세요."});
    
    if (!password) return res.json({isSuccess: false, code: 302, message: "비밀번호를 입력 해주세요."});

    try {
        const connection = await pool.getConnection(async conn => conn);

        try {
            const [doctorUserInfoRows] = await userDao.selectDoctorUserInfo(id); //의사의 id인지 확인
            const [guardianUserInfoRows] = await userDao.selectGuardianUserInfo(id); //보호자의 id인지 확인

            if (doctorUserInfoRows.length < 1 && guardianUserInfoRows.length < 1) {
                connection.release();
                return res.json({
                    isSuccess: false,
                    code: 310,
                    message: "id/비밀번호를 확인해주세요.(둘 다 없음)"
                });
            }

            const hashedPassword = await crypto.createHash('sha512').update(password).digest('hex');
            //console.log(hashedPassword);
            if (doctorUserInfoRows.length>0 && doctorUserInfoRows[0].pwd !== hashedPassword) {
                //의사 id이지만, 비밀번호 다를 경우
                connection.release();
                return res.json({
                    isSuccess: false,
                    code: 311,
                    message: "id/비밀번호를 확인해주세요.(의사 id인데 비밀번호 틀)"
                });
            }

            if (guardianUserInfoRows.length>0 && guardianUserInfoRows[0].pwd !== hashedPassword) {
                //보호자 id이지만, 비밀번호 다를 경우
                connection.release();
                return res.json({
                    isSuccess: false,
                    code: 311,
                    message: "id/비밀번호를 확인해주세요.(보호자 id인데 비밀번호 틀)"
                });
            }
            
            
            if(guardianUserInfoRows.length>0){
                let token = await jwt.sign({
                    id: guardianUserInfoRows[0].guardian_id,
                    type: "guardian"
                }, // 토큰의 내용(payload)
                secret_config.jwtsecret, // 비밀 키
                {
                    expiresIn: '365d',
                    subject: 'userInfo',
                } // 유효 시간은 365일
            );
                res.json({
                //userInfo: userInfoRows[0],
                jwt: token,
                isSuccess: true,
                code: 200,
                message: "로그인 성공",
                type:1
            });
            }else if(doctorUserInfoRows.length>0){
                let token = await jwt.sign({
                    id: doctorUserInfoRows[0].doctor_id,
                    type:"doctor"
                }, // 토큰의 내용(payload)
                secret_config.jwtsecret, // 비밀 키
                {
                    expiresIn: '365d',
                    subject: 'userInfo',
                } // 유효 시간은 365일
            );
                res.json({
                //userInfo: userInfoRows[0],
                jwt: token,
                isSuccess: true,
                code: 200,
                message: "로그인 성공",
                type:0
            });
            }

            

           

            connection.release();
        } catch (err) {
            logger.error(`App - SignIn Query error\n: ${JSON.stringify(err)}`);
            connection.release();
            return false;
        }
    } catch (err) {
        logger.error(`App - SignIn DB Connection error\n: ${JSON.stringify(err)}`);
        return false;
    }
};

//id/비밀번호 찾기
exports.findId = async function (req, res) {
    const {
        name, phone_number
    } = req.body;

    if (!name) return res.json({isSuccess: false, code: 301, message: "이름을 입력해주세요."});
    
    if (!phone_number) return res.json({isSuccess: false, code: 302, message: "휴대폰 번호를 입력 해주세요."});

    try {
        const connection = await pool.getConnection(async conn => conn);

        try {
            const [idRows] = await userDao.getIdByInfo(name,phone_number);

           
            //isdeleted 
            if (idRows.length<1) {
                connection.release();
                return res.json({
                    isSuccess: false,
                    code: 303,
                    message: "등록된 아이디가 없습니다."
                });
            }

            res.json({
                isSuccess: true,
                code: 200,
                data:idRows[0],
                message: "아이디찾기 성공"
            });

            connection.release();
        } catch (err) {
            logger.error(`App - SignIn Query error\n: ${JSON.stringify(err)}`);
            connection.release();
            return false;
        }
    } catch (err) {
        logger.error(`App - SignIn DB Connection error\n: ${JSON.stringify(err)}`);
        return false;
    }
};

exports.findPassword = async function (req, res) {
    const {
        name, phone_number,id
    } = req.body;

    if (!name) return res.json({isSuccess: false, code: 301, message: "이름을 입력해주세요."});
    
    if (!phone_number) return res.json({isSuccess: false, code: 302, message: "휴대폰 번호를 입력 해주세요."});

    if (!id) return res.json({isSuccess: false, code: 303, message: "아이디를 입력해주세요."});

    try {
        const connection = await pool.getConnection(async conn => conn);

        try {
            const [pwdRows] = await userDao.getPwdByInfo(name,phone_number,id);

           
            //isdeleted 
            if (pwdRows.length<1) {
                connection.release();
                return res.json({
                    isSuccess: false,
                    code: 304,
                    message: "등록된 아이디가 없습니다."
                });
            }

            res.json({
                isSuccess: true,
                code: 200,
                data:pwdRows[0],
                message: "비밀번호 찾기 성공"
            });

            connection.release();
        } catch (err) {
            logger.error(`App - SignIn Query error\n: ${JSON.stringify(err)}`);
            connection.release();
            return false;
        }
    } catch (err) {
        logger.error(`App - SignIn DB Connection error\n: ${JSON.stringify(err)}`);
        return false;
    }
};



exports.check = async function (req, res) {
    res.json({
        isSuccess: true,
        code: 200,
        message: "검증 성공",
        info: req.verifiedToken
    })
};
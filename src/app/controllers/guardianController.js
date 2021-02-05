const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');

const guardianDao = require('../dao/guardianDao');
const userDao = require('../dao/userDao');

const secret_config = require('../../../config/secret');
//const jwtMiddleware = require('../../../config/jwtMiddleware');
const jwt = require('jsonwebtoken');



exports.newBooking = async function (req, res) {
    try {
        const token = req.headers['x-access-token'];
        var decoded = jwt.verify(token, secret_config.jwtsecret);
        if(decoded.type=='guardian'){
            id=decoded.id;
            const {doctor_id ,date, time}=req.body;
            //의사 id가 제대로 된 것인지
            const checkidRow = await userDao.selectDoctorUserInfo(doctor_id);
            //console.log(checkidRow[0]);
            if(checkidRow[0].length<1){
                return res.json({
                    isSuccess: false,
                    code: 300,
                    message: "존재하지 않는 의사id 입니다."
                });
            }
            if(!date) return res.json({isSuccess: false, code: 301, message: "날짜를 선택해주세요."});
            if(!time) return res.json({isSuccess: false, code: 302, message: "시간을 선택해주세요."});
            //예약 중복 확인
            const checkRow = await guardianDao.checkOverlapbooking(doctor_id,date,time);
            if(checkRow.length>0){
                return res.json({
                    isSuccess: false,
                    code: 301,
                    message: "이미 예약된 날짜입니다."
                });
            }
            
            
            const insertParams = [id,doctor_id, date,time];
            
            const insertRows = await guardianDao.insertNewBooking(insertParams);
            return res.json({
                isSuccess: true,
                code: 200,
                message: "예약 성공"
            });

        }else{
            return res.json({
            isSuccess: false,
            code: 201,
            message: "접근 권한이 없습니다."
        });
    }

        //  await connection.commit(); // COMMIT
        // connection.release();
    } catch (err) {
        // await connection.rollback(); // ROLLBACK
        // connection.release();
        logger.error(`App - getBoard Query error\n: ${err.message}`);
        return res.status(500).send(`Error: ${err.message}`);
    }
};

exports.getDoctorInfo = async function (req, res) {
    try {
        const token = req.headers['x-access-token'];
        var decoded = jwt.verify(token, secret_config.jwtsecret);
        if(decoded.type=='guardian'){
           const id=decoded.id;
            const {doctor_id}=req.body;
            //의사 id가 제대로 된 것인지
            const checkidRow = await userDao.selectDoctorUserInfo(doctor_id);
            if(checkidRow[0].length<1){
                return res.json({
                    isSuccess: false,
                    code: 300,
                    message: "존재하지 않는 의사id 입니다."
                });
            }

            //의사 정보 불러오기
            const selectedRow = await guardianDao.getDoctorInfo(doctor_id);
        
            if (selectedRow.length>0) {

                return res.json({
                    isSuccess: true,
                    code: 200,
                    message: "조회 성공.",
                    data: selectedRow
                });
            }else{
                return res.json({
                    isSuccess: false,
                    code: 301,
                    message: "의사에 대한 정보가 없습니다."
                });
            }
        }else{
            return res.json({
            isSuccess: false,
            code: 201,
            message: "접근 권한이 없습니다."
        });
    }
        //  await connection.commit(); // COMMIT
        // connection.release();
    } catch (err) {
        // await connection.rollback(); // ROLLBACK
        // connection.release();
        logger.error(`App - getBoard Query error\n: ${err.message}`);
        return res.status(500).send(`Error: ${err.message}`);
    }
};

exports.getOpinionList = async function (req, res) {
    try {
        const token = req.headers['x-access-token'];
        var decoded = jwt.verify(token, secret_config.jwtsecret);
        if(decoded.type=='guardian'){
            const id=decoded.id;

            //의사 소견 리스트 가져오기
            const listRow = await guardianDao.getOpinionList(id);
        
            if (listRow.length>0) {

                return res.json({
                    isSuccess: true,
                    code: 200,
                    message: "조회 성공.",
                    data: listRow
                });
            }else{
                return res.json({
                    isSuccess: false,
                    code: 300,
                    message: "소견 내역이 없습니다."
                });
            }
        }else{
            return res.json({
            isSuccess: false,
            code: 201,
            message: "접근 권한이 없습니다."
        });
    }
        //  await connection.commit(); // COMMIT
        // connection.release();
    } catch (err) {
        // await connection.rollback(); // ROLLBACK
        // connection.release();
        logger.error(`App - getBoard Query error\n: ${err.message}`);
        return res.status(500).send(`Error: ${err.message}`);
    }
};

exports.getDetailOpinion = async function (req, res) {
    try {
        const token = req.headers['x-access-token'];
        var decoded = jwt.verify(token, secret_config.jwtsecret);
        if(decoded.type=='guardian'){
            const id=decoded.id; //아마 필요할듯? 추가하자
            const opinion_idx=req.params.opinion_idx;
            //의사 소견 상세 조회
            const detailRow = await guardianDao.getDetailOpinion(opinion_idx,id);
        
            if (detailRow.length>0) {

                return res.json({
                    isSuccess: true,
                    code: 200,
                    message: "조회 성공.",
                    data: detailRow
                });
            }else{
                return res.json({
                    isSuccess: false,
                    code: 300,
                    message: "소견 내역이 없습니다."
                });
            }
        }else{
            return res.json({
            isSuccess: false,
            code: 201,
            message: "접근 권한이 없습니다."
        });
    }
        //  await connection.commit(); // COMMIT
        // connection.release();
    } catch (err) {
        // await connection.rollback(); // ROLLBACK
        // connection.release();
        logger.error(`App - getBoard Query error\n: ${err.message}`);
        return res.status(500).send(`Error: ${err.message}`);
    }
};

exports.getBasicInfo = async function (req, res) {
    try {
        const token = req.headers['x-access-token'];
        var decoded = jwt.verify(token, secret_config.jwtsecret);
        if(decoded.type=='guardian'){
           const id=decoded.id;
            //배변횟수&아기체중
            const pooh_cnt=await guardianDao.getPoohCount(id);
            const weight=await guardianDao.getBabyWeight(id);
            //console.log(weight.length);
            if(pooh_cnt.length>0&&weight.length>0){
            return res.json({
                isSuccess: true,
                code: 200,
                message: "조회 성공.",
                data1: pooh_cnt,
                data2:weight
            });
        }else{
            return res.json({
                isSuccess: true,
                code: 300,
                message: "해당 정보가 없습니다."
            });
        }


        }else{
            return res.json({
            isSuccess: false,
            code: 201,
            message: "접근 권한이 없습니다."
        });
    }
        //  await connection.commit(); // COMMIT
        // connection.release();
    } catch (err) {
        // await connection.rollback(); // ROLLBACK
        // connection.release();
        logger.error(`App - getBoard Query error\n: ${err.message}`);
        return res.status(500).send(`Error: ${err.message}`);
    }
};
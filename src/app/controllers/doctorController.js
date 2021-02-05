const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');
const secret_config = require('../../../config/secret');
//const jwtMiddleware = require('../../../config/jwtMiddleware');
const jwt = require('jsonwebtoken');

const doctorDao = require('../dao/doctorDao');

exports.getPoohList = async function (req, res) {
    try {
        //id jwt 검사
        const token = req.headers['x-access-token'];
        var decoded = jwt.verify(token, secret_config.jwtsecret);
        if(decoded.type=='doctor'){
        //id가 db에 존재하는지 검사해야하나?
        const id=decoded.id;
        const lastRows = await doctorDao.getLastList(id);
        //console.log(lastRows.length);
        if(lastRows.length>0){

        for(var i=0;i<lastRows.length;i++){
            const baby_idx=lastRows[i]['baby_idx'];
            const listRows = await doctorDao.getListByIdx(baby_idx,id);
            //console.log(listRows.length);
            lastRows[i]['history']=listRows;
        }
            return res.json({
                isSuccess: true,
                code: 200,
                message: "조회 성공.",
                data: lastRows
            });
    }
        
        return res.json({
            isSuccess: false,
            code: 300,
            message: "배변 정보가 존재하지 않습니다."
        });
    } else{
        return res.json({
            isSuccess: false,
            code: 201,
            message: "접근 권한이 없습니다."
        });
    }
    } catch (err) {
        // await connection.rollback(); // ROLLBACK
        // connection.release();
        logger.error(`App - getBoard Query error\n: ${err.message}`);
        return res.status(500).send(`Error: ${err.message}`);
    }
};

exports.getPoohInfo = async function (req, res) {
    try {
        const token = req.headers['x-access-token'];
        var decoded = jwt.verify(token, secret_config.jwtsecret);
        if(decoded.type=='doctor'){
            const id=decoded.id;
            const pooh_info_idx=req.params.pooh_info_idx;
            const checkRow = await doctorDao.checkOverlap(pooh_info_idx,id);
            //console.log(checkRow);
            if(!pooh_info_idx){
                return res.json({
                    isSuccess: false,
                    code: 202,
                    message: "인덱스가 없습니다."
                });
            }
            if(checkRow.length>0){
                return res.json({
                    isSuccess: false,
                    code: 300,
                    message: "이미 작성된 배변 정보입니다."
                });
            }

            const selectedRow = await doctorDao.getPoohInfo(pooh_info_idx);
        
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
                    message: "배변 정보가 없습니다."
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

exports.newOpinion = async function (req, res) {
    try {
        const token = req.headers['x-access-token'];
        var decoded = jwt.verify(token, secret_config.jwtsecret);
        if(decoded.type=='doctor'){
            const id=decoded.id;
            const pooh_info_idx=req.params.pooh_info_idx;
            const checkRow = await doctorDao.checkOverlap(pooh_info_idx,id);
            //console.log(checkRow);
            if(!pooh_info_idx){
                return res.json({
                    isSuccess: false,
                    code: 202,
                    message: "인덱스가 없습니다."
                });
            }
            if(checkRow.length>0){
                return res.json({
                    isSuccess: false,
                    code: 300,
                    message: "이미 작성된 배변 정보입니다."
                });
            }

            const {type, comments}=req.body;
            if(!type) return res.json({isSuccess: false, code: 301, message: "배변 타입을 입력해주세요."});
            if(!comments) return res.json({isSuccess: false, code: 302, message: "소견을 입력해주세요."});

            if(comments.length>500){
                return res.json({
                    isSuccess: false,
                    code: 303,
                    message: "500자 이하로 서술해주세요."
                });
            }
            
            const insertParams = [pooh_info_idx,id, type,comments];
            
            const insertRows = await doctorDao.insertNewOpinion(insertParams);
            return res.json({
                isSuccess: true,
                code: 200,
                message: "소견 작성 성공"
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

exports.getPastOpinion = async function (req, res) {
    try {
        const token = req.headers['x-access-token'];
        var decoded = jwt.verify(token, secret_config.jwtsecret);
        if(decoded.type=='doctor'){
           const id=decoded.id;
           const pooh_info_idx=req.params.pooh_info_idx; // 선택된 배변 정보 idx
            if(!pooh_info_idx){
                return res.json({
                    isSuccess: false,
                    code: 202,
                    message: "인덱스가 없습니다."
                });
            }
            //배변정보& 과거에 의사가 작성했던 소견
            const selectedRow = await doctorDao.getPoohInfo(pooh_info_idx);
            const pastRow = await doctorDao.getPastOpinion(pooh_info_idx,id);

            if (selectedRow.length>0&&pastRow.length>0) {

                return res.json({
                    isSuccess: true,
                    code: 200,
                    message: "조회 성공.",
                    data1: selectedRow,
                    data2: pastRow
                });
            }else{
                return res.json({
                    isSuccess: false,
                    code: 301,
                    message: "작성 내역이 없습니다."
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



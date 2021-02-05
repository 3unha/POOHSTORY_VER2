const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');
const multer=require('multer');
const multerS3=require('multer-s3');
const AWS=require('aws-sdk');
const { response } = require('express');
const axios= require('axios');
const secret_config = require('../../../config/secret');
//const jwtMiddleware = require('../../../config/jwtMiddleware');
const jwt = require('jsonwebtoken');

const DLDao = require('../dao/DLDao');


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


//flask와 통신api


// test
exports.newPoohInfo = async function (req, res) {
    try{
        const token = req.headers['x-access-token'];
        var decoded = jwt.verify(token, secret_config.jwtsecret);
        if(decoded.type=='guardian'){
            const id=decoded.id;
            console.log(req.file);
            const { cnt,time, state, last_menu, weight, feature }= req.body;
            const img=req.file;

            if (!cnt) return res.json({isSuccess: false, code: 300, message: "배변 횟수를 입력해주세요."});

            if (!time) return res.json({isSuccess: false, code: 301, message: "배변 시기를 입력해주세요."});

            const checkRow = await DLDao.checkTime(time,id);

            if(checkRow.length>0){
                return res.json({
                    isSuccess: false,
                    code: 308,
                    message: "이미 등록된 시간입니다."
                });
            }

            if (!state) return res.json({isSuccess: false, code: 302, message: "배변 상태를 입력해주세요."});

            if (!last_menu) return res.json({isSuccess: false, code: 303, message: "직전 식단을 입력 해주세요."});

            if (!weight) return res.json({isSuccess: false, code: 304, message: "아기의 몸무게를 입력 해주세요."});

            if (!img) return res.json({isSuccess: false, code: 305, message: "사진을 입력 해주세요."});

            await axios({
                method: 'post',
                url:'http://15.164.148.215:5000/picture' ,
                data: {
                    "origin":req.file.location,
                    "filename":req.file.key
                }
              })
            .then((response)=> {
              //console.log(response.data.image);
              console.log("성공");
              if(response.data.errorcode==-1){
               urls=req.file.location;
              }else{
              urls=response.data.image;
            }
            })
            .catch((err)=> {
              console.log(err.message);
            })

            const baby = await DLDao.getBabyIdxById(id);
                console.log(baby[0].baby_idx);
                if(baby.length<1){
                    return res.json({
                        isSuccess: false,
                        code: 306,
                        message: "아기 정보가 없습니다."
                    });
                }

                const updateBabyWeight = await DLDao.updateWeight(baby[0].baby_idx,weight);
                const insertParams = [baby[0].baby_idx,cnt,time, state, last_menu, feature,urls];
                const insertDoctorUserRows = await DLDao.insertPoohInfo(insertParams); 
                return res.json({
                    isSuccess: true,
                    code: 200,
                    message: "성공."
                });

            


        }else{
            return res.json({
            isSuccess: false,
            code: 201,
            message: "접근 권한이 없습니다."
        });
    }
}catch (err) {
        // await connection.rollback(); // ROLLBACK
        // connection.release();
        logger.error(`App - DL Query error\n: ${err.message}`);
        return res.status(500).send(`Error: ${err.message}`);
    }    
    // }catch(err){
    //     console.log(err);
    //     response(res,500,"서버 에러");
    // }

};


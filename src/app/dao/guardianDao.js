const { pool } = require("../../../config/database");

// selectBoard
async function selectBoard(email) {
    const connection = await pool.getConnection(async (conn) => conn);
    const selectEmailQuery = `
                SELECT title, contents 
                FROM Board;
                `;
    const [boardRows] = await connection.query(
        selectEmailQuery
    );
    connection.release();

    return boardRows;
}

async function checkOverlapbooking(doctor_id,date,time) {
    const connection = await pool.getConnection(async (conn) => conn);
    const checkQuery = `
    select * from doctor_bookings where doctor_id=? and booking_date=? and booking_time=?;
                `;
    const params=[doctor_id,date,time];            
    const [checkRow] = await connection.query(
        checkQuery,
        params
    );
    connection.release();

    return checkRow;
}


async function insertNewBooking(insertParams) {
    const connection = await pool.getConnection(async (conn) => conn);
    const insertQuery = `
    insert into doctor_bookings(guardian_id,doctor_id, booking_date, booking_time) values (?,?,?,?);
      `;
    const insertRow = await connection.query(
      insertQuery,
      insertParams
    );
    connection.release();
    return insertRow;
  }


  async function getDoctorInfo(doctor_id) {
    const connection = await pool.getConnection(async (conn) => conn);
    const selectQuery = `
    select profile_img, name, hospital_name, address, hospital_number from doctor where doctor_id=?
                `;
    const params=[doctor_id];            
    const [selectRow] = await connection.query(
        selectQuery,
        params
    );
    connection.release();

    return selectRow;
}

async function getOpinionList(id) {
    const connection = await pool.getConnection(async (conn) => conn);
    const listQuery = `
    select baby_name,guardian_name,concat('날짜 ',pooh_time) as pooh_time,concat('배변횟수 ',pooh_cnt,'회') as pooh_cnt,concat('성별 ',if(gender='여','여','남')) as gender,concat('나이 ',age,'세') as age,opinion_idx,doctor_id, concat(name,' 의사') as doctor_name, if(opinion_idx is null,'미답변','답변완료') as isdone from (select pooh_info_idx,p_info.baby_idx, pooh_cnt, pooh_time, baby_name, gender, age,guardian_id ,guardian_name from (select pooh_info_idx, baby_idx, pooh_cnt,date_format(pooh_time,'%y.%m.%d %H:%i') as pooh_time from pooh_info) as p_info left outer join
     (select baby_idx, b_info.name as baby_name, gender, age, g_info.guardian_id,concat(g_info.name,'보호자님') as guardian_name from (select baby_idx,guardian_id, name, gender, (year(now())-left(birth,4)+1) as age from baby) as b_info left outer join (select guardian_id, name from guardian) as g_info using (guardian_id)) as c_info
using(baby_idx)) as pooh_info
    left outer join (select * from (select opinion_idx,pooh_info_idx,doctor_id,created_at from pooh_opinion) as op
    left outer join (select doctor_id, name from doctor) as d using (doctor_id)) as opinion_info using (pooh_info_idx) where guardian_id=? order by isdone='답변완료' desc,pooh_time desc,created_at desc;
                `;
    const params=[id];            
    const [listRow] = await connection.query(
        listQuery,
        params
    );
    connection.release();

    return listRow;
}

async function getDetailOpinion(opinion_idx,id) {
    const connection = await pool.getConnection(async (conn) => conn);
    const detailQuery = `
    select processed_photo, type, comments, doctor_id from (select opinion_idx, pooh_info_idx, doctor_id, type, comments from pooh_opinion) as op
    left outer join (select pooh_info_idx,processed_photo,guardian_id from (select pooh_info_idx,processed_photo,baby_idx from pooh_info) as p left outer join baby using(baby_idx)) as pooh using (pooh_info_idx) where opinion_idx=? and guardian_id=?
    `;
    const params=[opinion_idx,id];            
    const [detailRow] = await connection.query(
        detailQuery,
        params
    );
    connection.release();

    return detailRow;
}

async function getPoohCount(id) {
    const connection = await pool.getConnection(async (conn) => conn);
    const cntQuery = `
    select concat(if(max(pooh_cnt) is null,0,max(pooh_cnt))+1,'회')as pooh_cnt from pooh_info left outer join baby using (baby_idx) where guardian_id=? and date(pooh_info.created_at)=date(NOW());
    `;
    const params=[id];            
    const [cntRow] = await connection.query(
        cntQuery,
        params
    );
    connection.release();

    return cntRow;
}

async function getBabyWeight(id) {
    const connection = await pool.getConnection(async (conn) => conn);
    const weightQuery = `
    select weight from baby where guardian_id=?
    `;
    const params=[id];            
    const [weightRow] = await connection.query(
        weightQuery,
        params
    );
    connection.release();

    return weightRow;
}



module.exports = {
    selectBoard,
    insertNewBooking,
    checkOverlapbooking,
    getDoctorInfo,
    getOpinionList,
    getDetailOpinion,
    getPoohCount,
    getBabyWeight
};


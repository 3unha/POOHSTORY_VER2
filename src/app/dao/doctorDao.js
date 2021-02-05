const { pool } = require("../../../config/database");

// selectBoard
// async function selectBoard(email) {
//     const connection = await pool.getConnection(async (conn) => conn);
//     const selectEmailQuery = `
//                 SELECT title, contents 
//                 FROM Board;
//                 `;
//     const [boardRows] = await connection.query(
//         selectEmailQuery
//     );
//     connection.release();

//     return boardRows;
// }

async function getLastList(id) {
    const connection = await pool.getConnection(async (conn) => conn);
    const getListQuery = `
    select t1.pooh_info_idx,t1.baby_idx, concat('배변횟수 ',pooh_cnt,'회') as pooh_cnt,concat('날짜 ',date_format(pooh_time,'%y.%m.%d %H:%i'))as pooh_time, baby_name, if(gender='여','성별 여','성별 남')as gender, concat('나이 ',age) as age, guardian_name,t2.done,t2.none from (select * from (select pooh_info_idx,p_info.baby_idx, pooh_cnt, pooh_time, baby_name, gender, age, guardian_name from (select pooh_info_idx, baby_idx, pooh_cnt,pooh_time from pooh_info) as p_info left outer join
    (select baby_idx, b_info.name as baby_name, gender, age, concat(g_info.name,'보호자님') as guardian_name from (select baby_idx,guardian_id, name, gender, concat((year(now())-left(birth,4)+1),'세') as age from baby) as b_info left outer join (select guardian_id, name from guardian) as g_info using (guardian_id)) as c_info
using(baby_idx)) as pooh_info
   left outer join (select opinion_idx, pooh_info_idx from pooh_opinion where doctor_id=?) as opinion_info using (pooh_info_idx)) as t1,
             (select baby_idx, max(pooh_time) as last , if(count(opinion_idx)!=0,concat('답변완료 ',count(opinion_idx),'개'),'답변완료 0개')as done,concat('미답변 ',count(*)-count(opinion_idx),'개') as none from (select * from (select pooh_info_idx,p_info.baby_idx, pooh_cnt, pooh_time, baby_name, gender, age, guardian_name from (select pooh_info_idx, baby_idx, pooh_cnt,pooh_time from pooh_info) as p_info left outer join
    (select baby_idx, b_info.name as baby_name, gender, age, concat(g_info.name,'보호자님') as guardian_name from (select baby_idx,guardian_id, name, gender, concat((year(now())-left(birth,4)+1),'세') as age from baby) as b_info left outer join (select guardian_id, name from guardian) as g_info using (guardian_id)) as c_info
using(baby_idx)) as pooh_info
   left outer join (select opinion_idx, pooh_info_idx from pooh_opinion where doctor_id=?) as opinion_info using (pooh_info_idx)) as rep_info group by baby_idx) as t2
where t1.pooh_time=t2.last and t1.baby_idx=t2.baby_idx;
                `;
    const params=[id,id];            
    const [lastRows] = await connection.query(
        getListQuery,
        params
    );
    connection.release();

    return lastRows;
}

async function getListByIdx(baby_idx,id) {
    const connection = await pool.getConnection(async (conn) => conn);
    const getListQuery = `
    select pooh_info_idx,pooh_time, if(opinion_idx is null,'미답변','답변완료') as isdone from (select baby_idx,pooh_info_idx,concat('날짜 ',date_format(pooh_time,'%y.%m.%d %H:%i')) as pooh_time from pooh_info)as p_info
    left outer join (select opinion_idx,pooh_info_idx from pooh_opinion where doctor_id=?)as o_info using(pooh_info_idx) where baby_idx=? order by pooh_time desc;
               `;
    const params=[id,baby_idx];            
    const [listRows] = await connection.query(
        getListQuery,
        params
    );
    connection.release();

    return listRows;
}

async function getPoohInfo(pooh_info_idx) {
    const connection = await pool.getConnection(async (conn) => conn);
    const selectedQuery = `
    select processed_photo,concat(pooh_cnt,'회') as pooh_cnt,date_format(pooh_time,'%y.%m.%d %H:%i') as pooh_time, state, last_menu,weight, feature from (select processed_photo,baby_idx, pooh_cnt, pooh_time, state, last_menu, feature from pooh_info where pooh_info_idx=?) as p_info
left outer join (select baby_idx,weight from baby) as b_info using (baby_idx);
                `;
    const params=[pooh_info_idx];            
    const [selectedRow] = await connection.query(
        selectedQuery,
        params
    );
    connection.release();

    return selectedRow;
}

async function checkOverlap(pooh_info_idx,id) {
    const connection = await pool.getConnection(async (conn) => conn);
    const checkQuery = `
    select * from pooh_opinion where pooh_info_idx=? and doctor_id=?
                `;
    const params=[pooh_info_idx,id];            
    const [checkRow] = await connection.query(
        checkQuery,
        params
    );
    connection.release();

    return checkRow;
}

async function insertNewOpinion(insertParams) {
    const connection = await pool.getConnection(async (conn) => conn);
    const insertQuery = `
    insert into pooh_opinion(pooh_info_idx, doctor_id, type, comments) values (?,?,?,?);
                `;          
    const [insertRow] = await connection.query(
        insertQuery,
        insertParams
    );
    connection.release();

    return insertRow;
}

async function getPastOpinion(pooh_info_idx,id) {
    const connection = await pool.getConnection(async (conn) => conn);
    const pastQuery = `
    select type,comments from pooh_opinion where pooh_info_idx=? and doctor_id=?
                `;
    const params=[pooh_info_idx,id];            
    const [pastRow] = await connection.query(
        pastQuery,
        params
    );
    connection.release();

    return pastRow;
}


module.exports = {
    getLastList,
    getListByIdx,
    getPoohInfo,
    checkOverlap,
    insertNewOpinion,
    getPastOpinion
};

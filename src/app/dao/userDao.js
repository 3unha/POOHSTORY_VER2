

const { pool } = require("../../../config/database");

// Signup
async function userEmailCheck(email) {
  const connection = await pool.getConnection(async (conn) => conn);
  const selectEmailQuery = `
                SELECT email, nickname 
                FROM UserInfo 
                WHERE email = ?;
                `;
  const selectEmailParams = [email];
  const [emailRows] = await connection.query(
    selectEmailQuery,
    selectEmailParams
  );
  connection.release();

  return emailRows;
}

async function userNicknameCheck(nickname) {
  const connection = await pool.getConnection(async (conn) => conn);
  const selectNicknameQuery = `
                SELECT email, nickname 
                FROM UserInfo 
                WHERE nickname = ?;
                `;
  const selectNicknameParams = [nickname];
  const [nicknameRows] = await connection.query(
    selectNicknameQuery,
    selectNicknameParams
  );
  connection.release();
  return nicknameRows;
}

async function userIdCheck(id) {
  const connection = await pool.getConnection(async (conn) => conn);
  const selectIdQuery = `
  (select doctor_id from doctor where doctor_id=?) union
   (select guardian_id from guardian where guardian_id=?);
                `;
  const selectIdParams = [id,id];
  const [idRows] = await connection.query(
    selectIdQuery,
    selectIdParams
  );
  connection.release();

  return idRows;
}

//병원 list 3개
async function getHospitalList() {
  const connection = await pool.getConnection(async (conn) => conn);
  const listQuery = `
  select hospital_name from doctor;
                `;
  //const selectIdParams = [id,id];
  const [listRows] = await connection.query(
    listQuery
  );
  connection.release();

  return listRows;
}


async function insertUserInfo(insertUserInfoParams) {
  const connection = await pool.getConnection(async (conn) => conn);
  const insertUserInfoQuery = `
        INSERT INTO UserInfo(email, pswd, nickname)
        VALUES (?, ?, ?);
    `;
  const insertUserInfoRow = await connection.query(
    insertUserInfoQuery,
    insertUserInfoParams
  );
  connection.release();
  return insertUserInfoRow;
}

//의사정보 insert
async function insertDoctorUserInfo(insertDoctorUserInfoParams) {
  const connection = await pool.getConnection(async (conn) => conn);
  const insertDoctorUserInfoQuery = `
        INSERT INTO doctor(doctor_id, pwd, name, hospital_name, address, phone_number, hospital_number, profile_img,marketing)
        VALUES (?, ?, ?,?,?,?,?,?,?);
    `;
  const insertDoctorUserInfoRow = await connection.query(
    insertDoctorUserInfoQuery,
    insertDoctorUserInfoParams
  );
  connection.release();
  return insertDoctorUserInfoRow;
}

//보호자 정보 insert
async function insertGuardianUserInfo(insertGuardianUserInfoParams) {
  const connection = await pool.getConnection(async (conn) => conn);
  const insertGuardianUserInfoQuery = `
        INSERT INTO guardian(guardian_id, pwd, name, relationship, real_guardian, phone_number, path,marketing)
        VALUES (?, ?, ?,?,?,?,?,?);
    `;
  const insertGuardianUserInfoRow = await connection.query(
    insertGuardianUserInfoQuery,
    insertGuardianUserInfoParams
  );
  connection.release();
  return insertGuardianUserInfoRow;
}

//아기 정보 insert
async function insertBabyInfo(insertBabyInfoParams) {
  const connection = await pool.getConnection(async (conn) => conn);
  const insertBabyInfoQuery = `
        INSERT INTO baby(guardian_id, name, weight, address, birth, gender, using_hospital)
        VALUES (?, ?, ?,?,?,?,?);
    `;
  const insertBabyInfoRow = await connection.query(
    insertBabyInfoQuery,
    insertBabyInfoParams
  );
  connection.release();
  return insertBabyInfoRow;
}

//SignIn
// async function selectUserInfo(email) {
//   const connection = await pool.getConnection(async (conn) => conn);
//   const selectUserInfoQuery = `
//                 SELECT id, email , pswd, nickname, status 
//                 FROM UserInfo 
//                 WHERE email = ?;
//                 `;

//   let selectUserInfoParams = [email];
//   const [userInfoRows] = await connection.query(
//     selectUserInfoQuery,
//     selectUserInfoParams
//   );
//   return [userInfoRows];
// }

//의사 id인가?
async function selectDoctorUserInfo(id) {
  const connection = await pool.getConnection(async (conn) => conn);
  const selectUserInfoQuery = `
                SELECT doctor_id, pwd
                FROM doctor
                WHERE doctor_id = ?;
                `;

  let selectUserInfoParams = [id];
  const [doctoruserInfoRows] = await connection.query(
    selectUserInfoQuery,
    selectUserInfoParams
  );
  connection.release();
  return [doctoruserInfoRows];
}

//보호자 id인가?
async function selectGuardianUserInfo(id) {
  const connection = await pool.getConnection(async (conn) => conn);
  const selectUserInfoQuery = `
                SELECT guardian_id, pwd 
                FROM guardian
                WHERE guardian_id = ?;
                `;

  let selectUserInfoParams = [id];
  const [guardianuserInfoRows] = await connection.query(
    selectUserInfoQuery,
    selectUserInfoParams
  );
  connection.release();
  return [guardianuserInfoRows];
}

//id 찾기
async function getIdByInfo(name,phone_number) {
  const connection = await pool.getConnection(async (conn) => conn);
  const selectIdQuery = `
  (select doctor_id as id from doctor where name=? and phone_number=?) union
   (select guardian_id as id from guardian where name=? and phone_number=?);
                `;
  const selectIdParams = [name, phone_number,name, phone_number];
  const [idRows] = await connection.query(
    selectIdQuery,
    selectIdParams
  );
  connection.release();

  return [idRows];
}

//비밀번호 찾기
async function getPwdByInfo(name,phone_number,id) {
  const connection = await pool.getConnection(async (conn) => conn);
  const selectPwdQuery = `
  (select pwd from doctor where name=? and phone_number=? and doctor_id=?) union
   (select pwd from guardian where name=? and phone_number=? and guardian_id=?);
                `;
  const selectPwdParams = [name, phone_number,id,name, phone_number,id];
  const [pwdRows] = await connection.query(
    selectPwdQuery,
    selectPwdParams
  );
  connection.release();

  return [pwdRows];
}

module.exports = {
  // userEmailCheck,
  // userNicknameCheck,
  // insertUserInfo,
  // selectUserInfo,
  insertBabyInfo,
  insertDoctorUserInfo,
  insertGuardianUserInfo,
  selectDoctorUserInfo,
  selectGuardianUserInfo,
  userIdCheck,
  getIdByInfo,
  getPwdByInfo,
  getHospitalList
};

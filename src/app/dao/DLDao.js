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


async function getBabyIdxById(id) {
    const connection = await pool.getConnection(async (conn) => conn);
    const getListQuery = `
    select baby_idx from baby where guardian_id=?
    `;
    const params=[id];            
    const [listRows] = await connection.query(
        getListQuery,
        params
    );
    connection.release();

    return listRows;
}

async function updateWeight(baby_idx,weight) {
    const connection = await pool.getConnection(async (conn) => conn);
    const changeQuery = `
    update baby set weight=? where baby_idx=?
                `;
    const params=[weight,baby_idx];
    const [changeRow] = await connection.query(
        changeQuery,
        params
    );
    connection.release();

    return changeRow;
}

async function insertPoohInfo(insertParams) {
    const connection = await pool.getConnection(async (conn) => conn);
    const insertQuery = `
    insert into pooh_info(baby_idx, pooh_cnt, pooh_time, state, last_menu, feature, processed_photo) values (?,?,?,?,?,?,?);
      `;
    const insertRow = await connection.query(
      insertQuery,
      insertParams
    );
    connection.release();
    return insertRow;
  }

  async function checkTime(time,id) {
    const connection = await pool.getConnection(async (conn) => conn);
    const selectQuery = `
    select * from(select pooh_time,baby_idx from pooh_info) as p left outer join (select guardian_id,baby_idx from baby) as g using(baby_idx) where pooh_time=? and guardian_id=?

                  `;
    const selectParams = [time,id];
    const [ckRows] = await connection.query(
      selectQuery,
      selectParams
    );
    connection.release();
  
    return ckRows;
  }



module.exports = {
    selectBoard,
    getBabyIdxById,
    updateWeight,
    insertPoohInfo,
    checkTime
};

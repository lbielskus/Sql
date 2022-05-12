const express = require('express');
const router = express.Router();
const mysql = require('mysql2');
const dbConfig = require('../dbConfig');

router.get('/', (req, res) => {
    //?sortBy=salary&order=desc - query params
    console.log('query', req.query);

    const conn = mysql.createConnection(dbConfig);
    let sql = 'SELECT * FROM employees';
    const { sortBy, order, sex, search } = req.query;

    if (sortBy && order) {
        //conn.escapeId(sortBy) = `salary`
        sql = `SELECT * FROM employees ORDER BY ${conn.escapeId(sortBy)}`;
        sql = order === 'desc' ? sql + ' DESC' : sql + ' ASC';
    }
    if (sex) {
        sql = `SELECT * FROM employees WHERE sex = ${conn.escape(sex)}`;
    }
    if (search) {
        sql = `SELECT * FROM employees WHERE name LIKE CONCAT('%',${conn.escape(
            search
        )},'%')`;
    }

    console.log('sql', sql);
    conn.execute(sql, (err, result) => {
        if (err) {
            console.log('err', err);
            res.send({ msg: 'Klaida', err });
            return;
        }
        // console.log('result', result);
        if (result.length >= 1) {
            return res.send({
                msg: 'success',
                result: result,
            });
        }
        res.send({ msg: 'no data' });
    });
    conn.end();
});

router.post('/add', (req, res) => {
    // const body = {
    // name: 'James Delete',
    // salary: 2500,
    // age: 40,
    // experience: 7,
    // sex: 'male',
    // };
    const body = req.body;
    // conn
    const conn = mysql.createConnection(dbConfig);
    // query
    const sql = `
  INSERT INTO employees(name, salary, age, experience, sex)
  VALUES (?, ?, ?, ?, ?)
  `;
    // console.log('ob', Object.values(body));
    // execute - prepared statment
    conn.execute(sql, Object.values(body), (err, result) => {
        if (err) {
            res.send({ msg: 'fail', err });
            return console.log('err', err);
        }
        console.log('result', result);
        res.send({ msg: 'success', result });
    });
    // close
    conn.end();
});

router.get('/single/:id', (req, res) => {
    const id = req.params.id;
    const conn = mysql.createConnection(dbConfig);
    const sql = 'SELECT * FROM employees WHERE id = ?';
    conn.execute(sql, [id], (err, result) => {
        if (err) {
            console.log('err', err);
            res.send({ msg: 'fail', err });
            return;
        }
        console.log('result', result);
        if (result.length === 1) {
            return res.send({ msg: 'success', item: result[0] });
        }
        res.status(400).send({ msg: 'item not found' });
    });

    conn.end();
});
// veiktu su per postman atsiustais duomenimis
router.put('/edit/:id', (req, res) => {
    const id = req.params.id;
    const body = {
        name: 'James Bond',
        salary: 3000,
        age: 44,
        experience: 7,
        sex: 'male',
    };
    const conn = mysql.createConnection(dbConfig);
    const sql = `
  UPDATE employees SET 
    name = ?,
    salary = ?,
    age = ?,
    experience = ?,
    sex = ? 
  WHERE id = ?`;
    // console.log('values', [...Object.values(body), id]);
    conn.execute(sql, [...Object.values(body), id], (err, result) => {
        if (err) {
            console.log('err', err);
            res.send({ msg: 'Klaida', err });
            return;
        }
        console.log('result', result);
        res.send({ msg: 'Atnaujinti duomenys', result });
    });

    conn.end();
});

router.delete('/delete/:id', (req, res) => {
    const id = req.params.id;
    const sql = 'DELETE FROM employees WHERE id = ?';
    const conn = mysql.createConnection(dbConfig);
    conn.query(sql, [id], (err, result, fields) => {
        if (err) {
            res.send({ msg: 'fail', err });
            return console.log('err', err);
        }
        console.log('fields', fields);
        // patikrinti ar istrynem eilute
        if (result.affectedRows === 1) {
            return res.send({ msg: 'success', result, fields });
        }
        res.status(400).send({ msg: 'id not found or not provided' });
    });
    conn.end();
});

module.exports = router;
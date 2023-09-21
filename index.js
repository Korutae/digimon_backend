const pg = require('pg');
const client = new pg.Client('postgres://localhost/digimon_backend_db');
const express = require('express');
const app = express();
app.use(express.json());


//GET ALL DIGIMON
app.get('/api/digimon', async(req, res, next)=> {
    try {
        const SQL = `
            SELECT *
            FROM digimon
        `;
        const response = await client.query(SQL);
        console.log(response.rows);
        res.send(response.rows);
    }
    catch(error){
        next(error);
    }
});


//GET SINGLE DIGIMON
app.get("/api/digimon/:id", async (req, res, next) => {
    try {
      const SQL = `SELECT * FROM digimon WHERE id=$1;`;
      const response = await client.query(SQL, [req.params.id]);
      console.log(response.rows);
  
      if (!response.rows.length) {
        next({
          name: "MissingIDError",
          message: `Digimon with id ${req.params.id} not found`,
        });
      }  
      res.send(response.rows[0]);
    } catch (error) {
      next(error);
    }
  });

app.delete("/api/digimon/:id", async (req, res, next) => {
    try{
      const SQL = `
        DELETE 
        FROM digimon
        WHERE id = $1
      `;
      const response = await client.query(SQL, [req.params.id])
      res.send(response.rows);
    } catch(error) {
      next(error)
    }
});

app.post("/api/digimon", async (req,res,next) => {
  try {
    const SQL = `
    INSERT INTO digimon (name, rank)
    VALUES($1, $2)
    `;
    const response = await client.query(SQL, [req.body.name, req.body.rank])
  } catch (error) {
    next(error)
  }
})

app.use((error, req, res, next) => {
    res.status(500);
    res.send(error);
});

const setup = async()=> {
    await client.connect();
    console.log('connected to the database');
    const SQL = `
        DROP TABLE IF EXISTS digimon;
        CREATE TABLE digimon(
            id SERIAL PRIMARY KEY,
            name VARCHAR(20),
            rank VARCHAR(20)
        );
        INSERT INTO digimon (name, rank) VALUES ('Koromon', 'In Training');
        INSERT INTO digimon (name, rank) VALUES ('Agumon', 'Rookie');
        INSERT INTO digimon (name, rank) VALUES ('Greymon', 'Champion');
    `;
    await client.query(SQL);

    const port = process.env.PORT || 3000;
    app.listen(port, () => {
    console.log(`listening on port ${port}`);
    });
};

setup();
import { Request, Response } from "express";
import pgPromise from "pg-promise";

const db = pgPromise()(
  "postgress://postgres:postgres@localhost:5432/test_for_exercise"
);

const setupDb = async () => {
  db.none(`
    DROP TABLE IF EXISTS planets;
    
    CREATE TABLE planets (
        id SERIAL NOT NULL PRIMARY KEY,
        name TEXT NOT NULL,
        image TEXT
    );
    `);

  await db.none(`INSERT INTO planets (name) VALUES ('Earth')`);
  await db.none(`INSERT INTO planets (name) VALUES ('Mars')`);
};

setupDb();

const getAll = async (req: Request, res: Response) => {
  const planets = await db.many(`SELECT * FROM planets;`);
  console.log(planets);
  res.status(200).json(planets);
};

const getOneById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const planet = await db.one(`SELECT * FROM planets WHERE id=$1;`, Number(id));

  res.status(200).json(planet);
};

const create = async (req: Request, res: Response) => {
  const { name } = req.body;

  const newplanet = { name };
  await db.none(`INSERT INTO planets (name) VALUES($1)`, name);

  res.status(201).json({ msg: "the palanet was created." });
};

const updateById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name } = req.body;
  await db.none(`UPDATE planets SET name=$2 WHERE id=$1;`, [id, name])

  res.status(200).json({ msg: "The planets was updated." });
};

const deleteById = async (req: Request, res: Response) => {
  const { id } = req.params;
  await db.none(`DELETE FROM planets WHERE id=$1`, Number(id))

  res.status(200).json({ msg: "The planet was deleted." });
};

const createImage = async (req: Request, res: Response) => {
  const {id} = req.params
  const fileName = req.file?.path

  if(fileName) {
    db.none(`UPDATE planets SET image=$2 WHERE id=$1`, [id, fileName])
    res.status(200).json({msg: "Planet image uploaded succesfully."}) 
  } else {
    res.status(400).json({msg: "Planet image failed to upload"})
  }
  
  
}

export { getAll, getOneById, create, updateById, deleteById, createImage };

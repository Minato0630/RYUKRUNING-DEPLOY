import { MongoClient } from "mongodb";

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);

export default async function handler(req, res){

  await client.connect();
  const db = client.db("ryukGame");
  const col = db.collection("scores");

  if(req.method === "POST"){
    const { score } = req.body;
    await col.insertOne({score});
    return res.status(200).json({msg:"saved"});
  }

  if(req.method === "GET"){
    const top = await col.find()
      .sort({score:-1})
      .limit(1)
      .toArray();

    return res.json(top[0] || {score:0});
  }
}
import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.MONGO_URI);

export default async function handler(req, res){
  await client.connect();
  const db = client.db("RyukCluster");
  const col = db.collection("scores");

  if(req.method==="POST"){
    const {score} = req.body;
    await col.insertOne({score});
    return res.json({msg:"saved"});
  }

  if(req.method==="GET"){
    const top = await col.find().sort({score:-1}).limit(1).toArray();
    return res.json(top[0] || {score:0});
  }
}
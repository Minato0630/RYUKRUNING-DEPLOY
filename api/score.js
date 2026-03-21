import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.MONGO_URI);

export default async function handler(req, res) {
  await client.connect();
  const db = client.db("ryukGame");
  const col = db.collection("scores");

  if (req.method === "POST") {
    const { score, userId } = req.body;

    const existing = await col.findOne({ userId });

    let finalScore = score;

    if (!existing || score > existing.score) {
      await col.updateOne(
        { userId },
        { $set: { score } },
        { upsert: true }
      );
    } else {
      finalScore = existing.score;
    }

    return res.json({ score: finalScore }); // ✅ IMPORTANT
  }

  if (req.method === "GET") {
    const { userId } = req.query;
    const user = await col.findOne({ userId });

    return res.json({ score: user?.score || 0 });
  }
}
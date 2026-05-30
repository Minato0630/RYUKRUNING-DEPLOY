import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.MONGO_URI);

export default async function handler(req, res) {
  await client.connect();
  const db = client.db("ryukGame");
  const col = db.collection("scores");

  if (req.method === "POST") {
    const { score, userId, username } = req.body;

    const existing = await col.findOne({ userId });

    let finalScore = score;

    if (!existing || score > existing.score) {
      await col.updateOne(
        { userId },
        { $set: { score, username: username || "Ryuk Fan" } },
        { upsert: true }
      );
    } else {
      finalScore = existing.score;
      if (username && (!existing.username || existing.username !== username)) {
        await col.updateOne(
          { userId },
          { $set: { username } }
        );
      }
    }

    return res.json({ score: finalScore }); // ✅ IMPORTANT
  }

  if (req.method === "GET") {
    const { userId, leaderboard } = req.query;

    if (leaderboard === "true") {
      try {
        const topScores = await col.find().sort({ score: -1 }).limit(10).toArray();
        const formatted = topScores.map((item, idx) => ({
          rank: idx + 1,
          username: item.username || "Ryuk Fan",
          score: item.score
        }));
        return res.json({ leaderboard: formatted });
      } catch (err) {
        return res.status(500).json({ error: "Failed to load leaderboard" });
      }
    }

    const user = await col.findOne({ userId });

    return res.json({ score: user?.score || 0 });
  }
}
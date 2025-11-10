import { Client } from "@elastic/elasticsearch";
import dotenv from "dotenv";
dotenv.config();

const es = new Client({
  node: process.env.ES_NODE || "http://localhost:9200",
});

const INDEX = "emails";

async function resetElasticsearch() {
  try {
    console.log("⚠️  Deleting existing index (if any)...");
    const exists = await es.indices.exists({ index: INDEX });
    if (exists) {
      await es.indices.delete({ index: INDEX });
      console.log("🗑️  Old index deleted successfully.");
    } else {
      console.log("ℹ️  No existing index found.");
    }

    console.log("🧱 Creating new index schema...");
    await es.indices.create({
      index: INDEX,
      mappings: {
        properties: {
          accountId: { type: "keyword" },
          folder: { type: "keyword" },
          from: { type: "text" },
          to: { type: "text" },
          subject: { type: "text" },
          text: { type: "text" },
          date: { type: "date" },
          label: { type: "keyword" },
        },
      },
    });

    console.log("✅ Fresh 'emails' index created successfully.");
    console.log("✨ Now run your server again to fetch and reindex emails.");
  } catch (err: any) {
    console.error("❌ Error resetting Elasticsearch:", err.message);
  }
}

resetElasticsearch();

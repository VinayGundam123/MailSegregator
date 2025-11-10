import { Client } from "@elastic/elasticsearch";
import {
  Transport,
  TransportRequestParams,
  TransportRequestOptions,
  TransportResult,
} from "@elastic/transport";

class CustomTransport extends Transport {
  override async request<TResponse = unknown, TContext = unknown>(
    params: TransportRequestParams,
    options?: TransportRequestOptions
  ): Promise<TransportResult<TResponse, TContext>> {
    const patchedParams = {
      ...(params as any),
      headers: {
        ...(params as any).headers,
        accept: "application/vnd.elasticsearch+json; compatible-with=8",
        "content-type":
          "application/vnd.elasticsearch+json; compatible-with=8",
      },
    };
    return super.request(patchedParams, options);
  }
}

const es = new Client({
  node: process.env.ES_NODE || "http://localhost:9200",
  Transport: CustomTransport,
});

const INDEX = "emails";


export async function ensureIndex() {
  try {
    const exists = await es.indices.exists({ index: INDEX });
    if (!exists) {
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
            suggestedReply: { type: "text" },
          },
        },
      } as any);
      console.log("Elasticsearch index 'emails' created");
    }
  } catch (error: any) {
    console.error("Elasticsearch ensure index error:", error?.message || error);
    throw error;
  }
}

export async function indexEmail(doc: Record<string, any>) {
  try {
    await ensureIndex();
    const id = doc.messageId || `${doc.accountId}-${Date.now()}`;
    await es.index({
      index: INDEX,
      id,
      document: doc,
    });
    await es.indices.refresh({ index: INDEX });
    return id;
  } catch (error: any) {
    console.error("Elasticsearch indexing error:", error?.message || error);
    console.error("ES Error details:", {
      type: error?.meta?.body?.error?.type,
      reason: error?.meta?.body?.error?.reason,
    });
    throw error;
  }
}

export async function searchEmails(
  q = "",
  opts: { folder?: string; accountId?: string } = {}
) {
  const must: any[] = [];

  if (q) {
    must.push({
      multi_match: {
        query: q,
        fields: ["subject", "text", "from", "to"],
      },
    });
  }

  if (opts.folder) {
    must.push({ term: { folder: opts.folder } });
  }

  if (opts.accountId) {
    must.push({ term: { accountId: opts.accountId } });
  }

  const body: any = {
    size: 50,
    sort: [{ date: { order: "desc" } }],
  };

  if (must.length > 0) {
    body.query = { bool: { must } };
  } else {
    body.query = { match_all: {} };
  }

  const result = await es.search({
    index: "emails",
    body,
  });

  return result.hits.hits.map((hit) => hit._source);
}

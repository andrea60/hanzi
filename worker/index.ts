import { env } from "cloudflare:workers";

const versionPathRegex = /\/api\/dataset\/(\d+\.\d+\.\d+)$/;
export default {
  async fetch(request: Request) {
    const url = new URL(request.url);

    const datasetMatch = url.pathname.match(versionPathRegex);
    if (datasetMatch) {
      const [, version] = datasetMatch;
      const dataset = await env.DATASETS_BUCKET.get(version);
      if (!dataset) return new Response("Dataset not found", { status: 404 });

      return new Response(dataset.body, {
        status: 200,
        headers: { ContentType: "application/json", ContentEncoding: "gzip" },
      });
    }

    return new Response(null, { status: 404 });
  },
};

import { env } from "cloudflare:workers";

const versionPathRegex = /\/api\/dataset\/latest.json.gz\/*$/;
export default {
  async fetch(request: Request) {
    const url = new URL(request.url);

    if (url.pathname.match(versionPathRegex)) {
      const datasets = await env.DATASETS_BUCKET.list();

      const latest = datasets.objects
        .sort((a, b) => a.key.localeCompare(b.key))
        .pop();

      if (!latest)
        return new Response("No datasets available", { status: 404 });

      const versionRegex = /dataset-(\d+)\.json/;
      const [, version] = latest.key.match(versionRegex) || [];

      const dataset = await env.DATASETS_BUCKET.get(latest.key);
      if (!dataset)
        return new Response("Dataset disappeared during request processing", {
          status: 500,
        });
      console.log(
        `Serving dataset version ${version} from ${latest.key} (size: ${dataset.size} bytes)`
      );
      return new Response(dataset.body, {
        status: 200,
        headers: {
          "X-Dataset-Version": version,
          "X-Dataset-Length": dataset.size.toString(),
          "Content-Type": "application/json",
          "Content-Encoding": "gzip",
          "Cache-Control": "no-transform",
        },
      });
    }

    return new Response("Endpoint not found", { status: 404 });
  },
};

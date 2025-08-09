import { env } from "cloudflare:workers";

const downloadPathRegex = /\/api\/dataset\/latest.json.gz\/*$/;
const getVersionPathRegex = /\/api\/dataset\/version$/;

const getDatasetMetadata = (item: R2Object) => {
  const versionRegex = /dataset-(\d+)\.json/;
  const [, version] = item.key.match(versionRegex) || [];
  if (!version) return null;
  return {
    item,
    version: Number(version),
  };
};

export default {
  async fetch(request: Request) {
    const url = new URL(request.url);

    // Get latest version metadata
    if (url.pathname.match(getVersionPathRegex)) {
      const datasets = await env.DATASETS_BUCKET.list();

      const latest = datasets.objects
        .map(getDatasetMetadata)
        .filter((i) => !!i)
        .sort((a, b) => (a.version < b.version ? -1 : 1))
        .pop();

      if (!latest)
        return new Response("No datasets available", { status: 404 });

      return Response.json({ version: Number(latest.version) });
    }

    // Dataset download
    if (url.pathname.match(downloadPathRegex)) {
      const datasets = await env.DATASETS_BUCKET.list();

      const latest = datasets.objects
        .map(getDatasetMetadata)
        .filter((i) => !!i)
        .sort((a, b) => (a.version < b.version ? -1 : 1))
        .pop();

      if (!latest)
        return new Response("No datasets available", { status: 404 });

      const versionRegex = /dataset-(\d+)\.json/;
      const [, version] = latest.item.key.match(versionRegex) || [];

      const dataset = await env.DATASETS_BUCKET.get(latest.item.key);
      if (!dataset)
        return new Response("Dataset disappeared during request processing", {
          status: 500,
        });
      console.log(
        `Serving dataset version ${version} from ${latest.item.key} (size: ${dataset.size} bytes)`
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

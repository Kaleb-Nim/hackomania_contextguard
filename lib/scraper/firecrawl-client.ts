import FirecrawlApp from "@mendable/firecrawl-js";

let _instance: FirecrawlApp | null = null;

export function getFirecrawl(): FirecrawlApp {
  if (!_instance) {
    _instance = new FirecrawlApp({
      apiKey: process.env.FIRECRAWL_API_KEY ?? "",
    });
  }
  return _instance;
}

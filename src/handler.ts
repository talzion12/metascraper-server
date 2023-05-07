import fetch, { HeadersInit } from "node-fetch";
import metascraper from "metascraper";

export const defaultRuleNames = [
  "date",
  "description",
  "image",
  "logo",
  "publisher",
  "title",
];

export async function handler(
  url: string,
  ruleNames: string[],
  headers: HeadersInit
) {
  const rules = await Promise.all(
    ruleNames.map((ruleName) => import(`metascraper-${ruleName}`))
  );
  const metascraperInstance = metascraper(rules);

  const response = await fetch(url, { headers });
  const body = await response.text();

  if (!response.ok) {
    throw new Error("Failed to get URL");
  }

  const result = await metascraperInstance({
    url,
    html: body,
  });

  return result;
}

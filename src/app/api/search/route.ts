import { searchPriorityKeywords, type PriorityResult } from "@/lib/search-keywords";
import { gettingStarted, guides, setup, tools } from "@/lib/source";
import { createSearchAPI } from "fumadocs-core/search/server";

type SearchResult = {
  type: "page" | "heading" | "text";
  id: string;
  url: string;
  content: string;
  description?: string;
  [key: string]: unknown;
};

// limit the number of results to avoid overwhelming the user and to improve performance
const MAX_RESULTS = 12;
const MAX_CHILD_RESULTS_PER_PAGE = 1;

const pages = [
  ...setup.getPages(),
  ...gettingStarted.getPages(),
  ...guides.getPages(),
  ...tools.getPages(),
];

const pageByUrl = new Map(pages.map((page) => [page.url, page]));
const validPageUrls = new Set(pages.map((page) => page.url));

// this is the actual full-text search instead of only checking the keyword map
const searchServer = createSearchAPI("advanced", {
  language: "english",
  indexes: pages.map((page) => ({
    title: page.data.title,
    description: page.data.description,
    url: page.url,
    id: page.url,
    structuredData: page.data.structuredData,
  })),
});

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = url.searchParams.get("query")?.trim();

  if (!query) return Response.json([]);

  const docsResponse = await searchServer.GET(request);

  if (!docsResponse.ok) return docsResponse;

  const docsJson = await docsResponse.json();
  const docsResults = Array.isArray(docsJson)
    ? (docsJson as SearchResult[])
    : [];

  // these still go first, but now they are treated like boosted page groups
  const priorityResults = searchPriorityKeywords(query)
    .filter((result) => validPageUrls.has(result.url))
    .map(priorityResultToSearchResult);

  // keeps headings/text under the page they actually belong to 
  const results = groupResultsByPage(priorityResults, docsResults);

  return Response.json(results.slice(0, MAX_RESULTS));
}

// Convert to search result format
function priorityResultToSearchResult(r: PriorityResult): SearchResult {
  return {
    type: "page" as const,
    id: r.url,
    url: r.url,
    content: r.title,
    description: r.description,
  };
}

// groups search results by page so headings/text show under the page they actually belong to
// without this you end up with the search result making it look like Player Owned Ports is how damage is dealt lol
function groupResultsByPage(
  priorityResults: SearchResult[],
  docsResults: SearchResult[],
): SearchResult[] {
  const results: SearchResult[] = [];
  const seenUrls = new Set<string>();
  const usedPageUrls = new Set<string>();
  const docsResultsByPage = groupDocsResultsByPage(docsResults);

  for (const priorityResult of priorityResults) {
    const pageUrl = getPageUrl(priorityResult.url);
    const pageDocsResults = docsResultsByPage.get(pageUrl) ?? [];

    addResult(results, seenUrls, priorityResult);

    // if a boosted page also has a matching heading/text result, show it directly under that page
    for (const childResult of getBestChildResults(pageDocsResults)) {
      addResult(results, seenUrls, childResult);
    }

    usedPageUrls.add(pageUrl);
  }

  for (const [pageUrl, pageDocsResults] of docsResultsByPage) {
    if (usedPageUrls.has(pageUrl)) continue;

    const pageResult = getPageResult(pageUrl, pageDocsResults);

    if (!pageResult) continue;

    addResult(results, seenUrls, pageResult);

    // this is what makes "Player Owned Ports" show the matching "Damage-boosting sigils" line
    for (const childResult of getBestChildResults(pageDocsResults)) {
      addResult(results, seenUrls, childResult);
    }

    usedPageUrls.add(pageUrl);
  }

  return results;
}

// organizes fumadocs results by their parent page URL
function groupDocsResultsByPage(
  docsResults: SearchResult[],
): Map<string, SearchResult[]> {
  const groupedResults = new Map<string, SearchResult[]>();

  for (const result of docsResults) {
    const pageUrl = getPageUrl(result.url);
    const pageResults = groupedResults.get(pageUrl) ?? [];

    pageResults.push(result);
    groupedResults.set(pageUrl, pageResults);
  }

  return groupedResults;
}


// returns the real page result, or creates one when only a heading/text match exists
function getPageResult(
  pageUrl: string,
  pageDocsResults: SearchResult[],
): SearchResult | undefined {
  const existingPageResult = pageDocsResults.find(
    (result) => result.type === "page",
  );

  if (existingPageResult) return existingPageResult;

  const page = pageByUrl.get(pageUrl);

  if (!page) return undefined;

  // if only a heading/text matched, synthesize the parent page so the result has context
  return {
    type: "page",
    id: page.url,
    url: page.url,
    content: page.data.title,
    description: page.data.description,
  };
}

// picks the best heading/text result to show under a page based on type and relevance, limiting to a maximum number of child results per page
function getBestChildResults(pageDocsResults: SearchResult[]): SearchResult[] {
  return pageDocsResults
    .filter((result) => result.type === "heading" || result.type === "text")
    .sort(compareChildResults)
    .slice(0, MAX_CHILD_RESULTS_PER_PAGE);
}

// sorts child results so headings are preferred over raw text snippets
function compareChildResults(a: SearchResult, b: SearchResult): number {
  const typeOrder = {
    heading: 0,
    text: 1,
    page: 2,
  };

  return typeOrder[a.type] - typeOrder[b.type];
}

// adds a result only if that exact URL has not already been added to the results, to avoid duplicates
function addResult(
  results: SearchResult[],
  seenUrls: Set<string>,
  result: SearchResult,
) {
  if (seenUrls.has(result.url)) return;

  seenUrls.add(result.url);
  results.push(result);
}

// strips off hash links so headings/text can be grouped under their parent page
function getPageUrl(url: string): string {
  return url.split("#")[0];
}
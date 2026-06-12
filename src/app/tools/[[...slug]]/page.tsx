import { FooterNav } from "@/components/footer-nav";
import { getPageImage, tools } from "@/lib/source";
import { getMDXComponents } from "@/mdx_components/mdx-components";
import { findNeighbour } from "fumadocs-core/page-tree";
import { createRelativeLink } from "fumadocs-ui/mdx";
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
} from "fumadocs-ui/page";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

interface ToolsPageProps {
  params: Promise<{
    slug?: string[];
  }>;
}

export default async function Page(props: ToolsPageProps) {
  const params = await props.params;
  const page = tools.getPage(params.slug);
  if (!page) notFound();

  const MDX = page.data.body;
  const neighbours = findNeighbour(tools.pageTree, page.url);

  return (
    <DocsPage toc={page.data.toc} full={page.data.full} footer={{ enabled: false }}>
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription>{page.data.description}</DocsDescription>
      <DocsBody>
        <MDX
          components={getMDXComponents({
            a: createRelativeLink(tools, page),
          })}
        />
        <FooterNav
          previous={neighbours.previous ? { name: neighbours.previous.name, url: neighbours.previous.url } : undefined}
          next={neighbours.next ? { name: neighbours.next.name, url: neighbours.next.url } : undefined}
        />
      </DocsBody>
    </DocsPage>
  );
}

export async function generateStaticParams() {
  return tools.generateParams();
}

export async function generateMetadata(
  props: ToolsPageProps,
): Promise<Metadata> {
  const params = await props.params;
  const page = tools.getPage(params.slug);
  if (!page) notFound();

  return {
    title: page.data.title,
    description: page.data.description,
    openGraph: {
      images: getPageImage(page).url,
    },
  };
}

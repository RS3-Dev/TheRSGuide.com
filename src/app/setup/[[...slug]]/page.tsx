import { getPageImage, setup } from '@/lib/source';
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
} from 'fumadocs-ui/page';
import { notFound } from 'next/navigation';
import { getMDXComponents } from '@/mdx_components/mdx-components';
import type { Metadata } from 'next';
import { createRelativeLink } from 'fumadocs-ui/mdx';
import { findNeighbour } from 'fumadocs-core/page-tree';
import { FooterNav } from '@/components/footer-nav';

export default async function Page(props: PageProps<'/setup/[[...slug]]'>) {
  const params = await props.params;
  const page = setup.getPage(params.slug);
  if (!page) notFound();

  const MDX = page.data.body;
  const neighbours = findNeighbour(setup.pageTree, page.url);

  return (
    <DocsPage toc={page.data.toc} full={page.data.full} footer={{ enabled: false }}>
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription>{page.data.description}</DocsDescription>
      <DocsBody>
        <MDX
          components={getMDXComponents({
            // this allows you to link to other pages with relative file paths
            a: createRelativeLink(setup, page),
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
  return setup.generateParams();
}

export async function generateMetadata(
  props: PageProps<'/setup/[[...slug]]'>,
): Promise<Metadata> {
  const params = await props.params;
  const page = setup.getPage(params.slug);
  if (!page) notFound();

  return {
    title: page.data.title,
    description: page.data.description,
    openGraph: {
      images: getPageImage(page).url,
    },
  };
}

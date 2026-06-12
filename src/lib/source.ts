import { setup as SetupPage, gettingStarted as GettingStartedPage, guides as GuidesPage, tools as ToolsPage } from '@/.source';
import { type InferPageType, loader } from 'fumadocs-core/source';
import { lucideIconsPlugin } from 'fumadocs-core/source/lucide-icons';

// See https://fumadocs.dev/docs/headless/source-api for more info
export const setup = loader({
  baseUrl: '/setup',
  source: SetupPage.toFumadocsSource(),
  plugins: [lucideIconsPlugin()],
});

export const gettingStarted = loader({
  baseUrl: '/getting-started',
  source: GettingStartedPage.toFumadocsSource(),
  plugins: [lucideIconsPlugin()],
});

export const guides = loader({
  baseUrl: '/guides',
  source: GuidesPage.toFumadocsSource(),
});

export const tools = loader({
  baseUrl: '/tools',
  source: ToolsPage.toFumadocsSource(),
});

export function getPageImage(page: InferPageType<typeof setup>) {
  const segments = [...page.slugs, 'image.png'];

  return {
    segments,
    url: `/og/docs/${segments.join('/')}`,
  };
}

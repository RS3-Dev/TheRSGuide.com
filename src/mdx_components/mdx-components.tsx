import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';
import { ImageZoom } from 'fumadocs-ui/components/image-zoom';
import { SplitContent, SplitItem, Center } from './components/split-content';
import { YouTubeEmbed } from './components/youtube-embed';
import { Steps, Step } from './components/steps';
import { InteractiveLegend } from './components/interactive-legend';
import { PlayerSearch } from './components/player-search';
import { QuestRequirements } from './components/quest-requirements';
import { SkillTrainingLookup } from './components/skill-training-lookup';
import { InteractiveMapMarker } from './components/interactive-map-marker';
import { CombatStyleAnalysis } from './components/combat-style-analysis';
import { GearProgression } from './components/gear-progression';
import { GearRecommendations } from './components/gear-recommendations';

// use this function to get MDX components, you will need it for rendering MDX
export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    img: (props) => <ImageZoom {...(props as any)} />,
    strong: (props) => (
      <strong className="font-extrabold" {...props} />
    ),
    SplitContent,
    SplitItem,
    Center,
    YouTubeEmbed,
    Steps,
    Step,
    InteractiveLegend,
    PlayerSearch,
    QuestRequirements,
    SkillTrainingLookup,
    InteractiveMapMarker,
    CombatStyleAnalysis,
    GearProgression,
    GearRecommendations,
    ...components,
  };
}

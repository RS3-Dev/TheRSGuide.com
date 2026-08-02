import {
  EfficiencyGuideTracker,
  type EfficiencyGuideData,
} from "@/components/mdx/efficiency-guide-tracker";
import efficiencyGuide from "@/data/efficiency-guide.json";

const guide = efficiencyGuide as EfficiencyGuideData;

export function EfficiencyGuideTool() {
  return <EfficiencyGuideTracker guide={guide} />;
}

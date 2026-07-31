'use client';

import React, { useState } from 'react';
import relicData from '@/data/leagues-ii/relics.json';
import { ArrowLeft } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface RelicItem {
  name: string;
  tagline: string;
  tier: number;
  image: string;
  effects: string[];
  notes: string[];
  skillSolves: SkillSolves[];
}

interface PassiveEffect {
    title: string;
    description: string;
}

interface RelicDisplayProps {
    tier: number;
    points: number;
}

interface SkillSolves {
    skill: string;
    grade: string;
}

const RelicDetailView: React.FC<{ relic: RelicItem; onBack: () => void }> = ({ relic, onBack }) => {
    return (
        <div className="bg-card/50 border my-4">
            <div className="flex p-4 gap-2">
                <div className="flex flex-col items-center gap-2">
                    <button onClick={onBack} className="text-card-foreground text-sm border border-primary rounded-md px-4 py-2 mr-8 mb-2 self-start hover:bg-accent"><ArrowLeft className="inline-block w-4 h-4 mr-2" />Back</button>
                    <img src={relic.image} alt={relic.name} style={{ width: '72px' }} />
                    <span className="font-display text-xl">{relic.name}</span>
                    <div className="flex flex-wrap justify-center gap-0.5 w-48">
                        {relic.skillSolves.map((solve, solveIndex) => (
                            <div className="bg-secondary py-1 px-2 flex w-18 h-8 border items-center" key={solveIndex}>
                                <img src={`/skills/${solve.skill}.png`} alt={solve.skill} className="w-6 mr-2 object-contain" />
                                <span key={solveIndex} className="mr-2 font-bold">{solve.grade}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <ScrollArea style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    <div>
                        <p className="w-full border-b font-semibold">Effects</p>
                        <ul className="bulleted-list">
                            {relic.effects.map((effect, effectIndex) => (
                                <li key={effectIndex}>{effect}</li>
                            ))}
                        </ul>
                    </div>
                    {relic.notes.length > 0 && (
                        <div>
                            <p className="w-full border-b font-semibold">Notes</p>
                            <ul className="bulleted-list">
                                {relic.notes.map((note, noteIndex) => (
                                    <li key={noteIndex}>{note}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </ScrollArea>
            </div>
        </div>
    );
}

const RelicCards: React.FC<{ relics: RelicItem[]; onViewRelic: (r: RelicItem) => void }> = ({ relics, onViewRelic }) => {
  return (
    <>
        <div className="flex gap-4 mx-auto my-0 flex-wrap">
            {relics.map((relic, relicIndex) => (
                <div key={relicIndex} className="bg-card/50 flex flex-col items-center p-4 border grow shrink basis-[30%] justify-between">
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1rem' }}>
                        <img src={relic.image} alt={relic.name} style={{ width: '128px' }} />
                        <span className="font-display text-xl mt-4 mb-2">{relic.name}</span>
                        <p className="mb-2 text-center">{relic.tagline}</p>
                    </div>
                    <button onClick={() => onViewRelic(relic)} className="text-card-foreground text-sm border border-primary rounded-md px-4 py-2 hover:bg-accent">View Details</button>
                </div>
            ))}
        </div>
    </>
  );
};

export const RelicDisplay: React.FC<RelicDisplayProps> = ({ tier, points }) => {

    const tierData = relicData.Relics.filter((data) => data.tier === tier);
    const tierPassives = relicData.Passives.find((data) => data.tier === tier)?.effects || [] as PassiveEffect[];

    const [selectedRelic, setSelectedRelic] = useState<RelicItem | null>(null);

    if (tierData.length === 0 && tier !== 0) {
        return (
                <div>
                        <h2 className="text-xl font-semibold mb-4">Tier {tier}</h2>
                        <div className="bg-card p-4">Relics have not been confirmed for this tier yet. Check back soon!</div>
                </div>
        )
    } else if (tierData.length === 0 && tier === 0) { // Hides unsorted relics if there are none
        return (
                <></>
        );
    }

      return (
        <div>
            {tier === 0 ? (
                <>
                    <h2>Unsorted Relics</h2>
                    <span>These relics have not had their tiers announced yet.</span>
                </>
            ) : (
                <div className="flex items-baseline gap-8 mb-4">
                    <h2 className="text-xl font-semibold mb-4">Tier {tier}</h2>
                    <span className="text-secondary-foreground">{points} points</span>
                </div>
            )}

            { tierPassives.length > 0 && (
                <div className="mb-2">
                    <span className="text-lg font-semibold mb-2">Passives</span>
                    <ul className="bulleted-list">
                        {tierPassives.map((passive, passiveIndex) => (
                            <li key={passiveIndex}><strong>{passive.title}:</strong> {passive.description}</li>
                        ))}
                    </ul>
                </div>
            )}

            {selectedRelic ? (
                <RelicDetailView relic={selectedRelic} onBack={() => setSelectedRelic(null)} />
            ) : (
                <RelicCards relics={tierData} onViewRelic={(r) => setSelectedRelic(r)} />
            )}
        </div>
      );
};

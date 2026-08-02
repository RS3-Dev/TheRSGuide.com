'use client';

import React, { useState } from 'react';
import relicData from '@/data/leagues-ii/relics.json';
import { LeaguesPassiveList, type LeaguesPassive } from '@/components/mdx/leagues-passive-list'

import '@/styles/relics.css';

import { ScrollArea } from '@/components/ui/scroll-area';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from '@/components/ui/drawer';

interface RelicItem {
  name: string;
  tagline: string;
  tier: number;
  image: string;
  effects: string[];
  notes: string[];
  skillSolves: SkillSolves[];
}

interface RelicDisplayProps {
    tier: number;
    points: number;
}

interface SkillSolves {
    skill: string;
    grade: string;
}

const RelicDetailView: React.FC<{ relic: RelicItem }> = ({ relic }) => {
    return (
        <>
            <DrawerHeader>
                <DrawerTitle className="text-2xl text-center">{relic.name}</DrawerTitle>
                <DrawerDescription className="text-center italic">{relic.tagline}</DrawerDescription>
            </DrawerHeader>
            <div className="p-4 flex flex-col gap-4 h-full">
                <div className="flex flex-col gap-4 items-center">
                    <img src={relic.image} alt={relic.name} className="w-32 h-32 object-contain" />
                    <div className="flex-1">
                        <div className="flex flex-wrap gap-2 mb-2">
                            {relic.skillSolves.map((solve) => (
                                <div key={`${relic.name}-${solve.skill}`} className="flex items-center gap-2 bg-secondary py-1 px-2">
                                    <img src={`/skills/${solve.skill}.png`} alt={solve.skill} className="w-6 h-6 object-contain" />
                                    <span className="font-bold">{solve.grade}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <ScrollArea style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                    <div>
                        <p className="w-full border-b text-secondary-foreground font-semibold">Effects</p>
                        <ul className="list-disc pl-5 py-2">
                            {relic.effects.map((effect, effectIndex) => (
                                <li key={effectIndex} className="list-item">{effect}</li>
                            ))}
                        </ul>
                    </div>
                    {relic.notes.length > 0 && (
                        <div>
                            <p className="w-full border-b text-secondary-foreground font-semibold">Notes</p>
                            <ul className="list-disc pl-5 py-2">
                                {relic.notes.map((note, noteIndex) => (
                                    <li key={noteIndex}>{note}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </ScrollArea>
            </div>
        </>
    );
}

const RelicCards: React.FC<{ relics: RelicItem[]; onViewRelic: (r: RelicItem) => void }> = ({ relics, onViewRelic }) => {
  return (
    <>
        <div className="relics-container mx-auto my-0">
            {relics.map((relic, relicIndex) => (
                <div key={relicIndex} className="bg-card/50 flex flex-col items-center p-4 border grow shrink basis-[30%] justify-between">
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1rem' }}>
                        <img src={relic.image} alt={relic.name} style={{ width: '128px' }} />
                        <span className="font-display text-xl mt-4 mb-2">{relic.name}</span>
                        <p className="mb-2 text-center text-secondary-foreground">{relic.tagline}</p>
                    </div>
                    <button type="button" onClick={() => onViewRelic(relic)} className="text-card-foreground text-sm border border-primary rounded-md px-4 py-2 hover:bg-accent">View Details</button>
                </div>
            ))}
        </div>
    </>
  );
};

function RelicDisplay({ tier, points }: RelicDisplayProps) {

    const relics = relicData.Relics.filter((relic) => relic.tier === tier) as RelicItem[]
    const passives = (relicData.Passives.find((entry) => entry.tier === tier)?.effects ?? []) as LeaguesPassive[]

    const [selectedRelic, setSelectedRelic] = useState<RelicItem | null>(null);

    if (relics.length === 0 && tier === 0) { // Hides unsorted relics if there are none
        return null;
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
                    { points !== undefined && points > 0 && (
                        <span className="text-secondary-foreground">{points} points</span>
                    )}
                </div>
            )}

            { passives.length > 0 && (
                <div className="mb-2">
                    <span className="text-lg font-semibold mb-2">Passives</span>
                    <LeaguesPassiveList passives={passives} />
                </div>
            )}

            { relics.length === 0 && tier !== 0 ? (
                <div>
                    <div className="bg-card p-4">Relics have not been confirmed for this tier yet. Check back soon!</div>
                </div>
            ) : (
                <RelicCards relics={relics} onViewRelic={(r) => setSelectedRelic(r)} />
            )}

            <Drawer direction="right" open={Boolean(selectedRelic)} onOpenChange={(open) => { if (!open) setSelectedRelic(null) }}>
                <DrawerContent>
                    {selectedRelic && (
                        <RelicDetailView relic={selectedRelic} />
                    )}
                </DrawerContent>
            </Drawer>
        </div>
      );
};

export { RelicDisplay };
export type { RelicDisplayProps };

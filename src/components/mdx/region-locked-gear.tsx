'use client';

import React from 'react';
import gearData from '@/data/gear-by-region.json';
import { TableScroll, ProseTableCell } from './prose';

interface GearItem {
  name: string;
  tier: number | string;
  skill: string;
  link?: string;
  note?: string;
  otherRegions?: Region[];
}

type Region = string;

type GearBySource = Record<string, GearItem[]>

type GearByCategory = Record<string, GearBySource>

type GearDataType = Record<Region, GearByCategory>;

interface RegionLockedGearProps {
  region: Region;
}

// Group items by tier for displaying alternatives
interface TierGroup {
  tier: number | string;
  skill: string;
  items: GearItem[];
}

const groupItemsByTier = (items: GearItem[]): TierGroup[] => {
  const groups: TierGroup[] = [];
  let currentGroup: TierGroup | null = null;

  items.forEach((item) => {
    if (currentGroup?.tier === item.tier && currentGroup?.skill === item.skill) {
      currentGroup.items.push(item);
    } else {
      currentGroup = { tier: item.tier, items: [item], skill: item.skill };
      groups.push(currentGroup);
    }
  });

  return groups;
};

const GearItem: React.FC<{item: GearItem}> = ({item}) => {

  const otherRegions = item.otherRegions?.map((region, index) => [
    index > 0 ? ", " : <><br />Also available in: </>, <a href={region}>{region}</a>
  ])

  return (
    <li>
      <a href={item.link} target="_blank" rel="noreferrer">{item.name}</a>
      {item.note && <br />}
      {item.note}
      {otherRegions}
    </li>
  )
}

const GearList: React.FC<{ title: string; items: GearItem[] }> = ({ title, items }) => {
  const tierGroups = groupItemsByTier(items);

  return (
    <div className="my-4">

      <h4>{title}</h4>

      <TableScroll>
        <table>
          <thead>
            <tr><th style={{width: '20%'}}>Tier</th><th>Item</th></tr>
          </thead>
          <tbody>
            {tierGroups.map((group, groupIndex) => (
              <tr key={groupIndex}>
                  <td><strong>{group?.tier}</strong><br />{group?.skill}</td>
                  <ProseTableCell>
                    <ul style={{paddingLeft: '0px'}}>
                      {group?.items?.map(item => (
                        <GearItem key={item.name} item={item} />
                      ))}
                    </ul>
                  </ProseTableCell>
                </tr>
            ))}
          </tbody>
        </table>
      </TableScroll>
    </div>
  );
};

export const RegionLockedGear: React.FC<RegionLockedGearProps> = ({ region }) => {
  const regionData: GearByCategory = (gearData as GearDataType)[region];

  if (!regionData) {
    return <div>Gear data not yet entered for {region}</div>;
  }

  return (
    <>
      {Object.keys(regionData).map(category => (
        <div key={category}>
          <h3>{category}</h3>
          {Object.keys(regionData[category]).map(source => (
            <GearList key={source} title={source} items={regionData[category][source]} />
          ))}
        </div>
      ))}
    </>
  );
};

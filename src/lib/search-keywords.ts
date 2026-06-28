/**
 * Priority search keywords mapping
 *
 * When a user searches for a term, if it matches a keyword here,
 * the mapped results will appear first before regular search results.
 */

export interface PriorityResult {
  url: string;
  title: string;
  description?: string;
}

export const searchKeywords: Record<string, PriorityResult[]> = {
  // Combat Styles
  "melee": [
    { url: "/guides/melee", title: "Melee Abilities Guide", description: "Comprehensive breakdown of Melee combat abilities" },
    { url: "/getting-started/melee", title: "Melee Combat Overview", description: "Introduction to Melee combat style" },
    { url: "/guides/gear-recommendations/melee", title: "Melee Gear Recommendations", description: "Recommended melee weapons and armour" },
  ],
  "ranged": [
    { url: "/guides/range", title: "Ranged Abilities Guide", description: "Comprehensive breakdown of Ranged combat abilities" },
    { url: "/getting-started/ranged", title: "Ranged Combat Overview", description: "Introduction to Ranged combat style" },
    { url: "/guides/gear-recommendations/ranged", title: "Ranged Gear Recommendations", description: "Recommended ranged weapons and armour" },
  ],
  "range": [
    { url: "/guides/range", title: "Ranged Abilities Guide", description: "Comprehensive breakdown of Ranged combat abilities" },
    { url: "/getting-started/ranged", title: "Ranged Combat Overview", description: "Introduction to Ranged combat style" },
  ],
  "magic": [
    { url: "/guides/magic", title: "Magic Abilities Guide", description: "Comprehensive breakdown of Magic combat abilities" },
    { url: "/getting-started/magic", title: "Magic Combat Overview", description: "Introduction to Magic combat style" },
    { url: "/guides/gear-recommendations/magic", title: "Magic Gear Recommendations", description: "Recommended magic weapons and armour" },
  ],
  "mage": [
    { url: "/guides/magic", title: "Magic Abilities Guide", description: "Comprehensive breakdown of Magic combat abilities" },
    { url: "/getting-started/magic", title: "Magic Combat Overview", description: "Introduction to Magic combat style" },
  ],
  "necromancy": [
    { url: "/guides/necromancy", title: "Necromancy Abilities Guide", description: "Comprehensive breakdown of Necromancy abilities and systems" },
    { url: "/getting-started/necromancy", title: "Necromancy Combat Overview", description: "Introduction to Necromancy combat style" },
    { url: "/guides/necromancy/conjures", title: "Necromancy Conjures", description: "Summoning undead allies in combat" },
    { url: "/guides/necromancy/incantations", title: "Necromancy Incantations", description: "Powerful Necromancy spells" },
  ],
  "necro": [
    { url: "/guides/necromancy", title: "Necromancy Abilities Guide", description: "Comprehensive breakdown of Necromancy abilities and systems" },
    { url: "/getting-started/necromancy", title: "Necromancy Combat Overview", description: "Introduction to Necromancy combat style" },
  ],

  // Abilities
  "abilities": [
    { url: "/getting-started/combat-basics", title: "Combat Basics", description: "Understanding ability types and how they work" },
    { url: "/guides/melee/basic-abilities", title: "Melee Basic Abilities", description: "Adrenaline-generating melee abilities" },
    { url: "/guides/range/basic-abilities", title: "Ranged Basic Abilities", description: "Adrenaline-generating ranged abilities" },
    { url: "/guides/magic/basic-abilities", title: "Magic Basic Abilities", description: "Adrenaline-generating magic abilities" },
  ],
  "basic abilities": [
    { url: "/guides/melee/basic-abilities", title: "Melee Basic Abilities", description: "Adrenaline-generating melee abilities" },
    { url: "/guides/range/basic-abilities", title: "Ranged Basic Abilities", description: "Adrenaline-generating ranged abilities" },
    { url: "/guides/magic/basic-abilities", title: "Magic Basic Abilities", description: "Adrenaline-generating magic abilities" },
  ],
  "enhanced": [
    { url: "/guides/melee/enhanced-abilities", title: "Melee Enhanced Abilities", description: "Powerful melee enhanced abilities" },
    { url: "/guides/range/enhanced-abilities", title: "Ranged Enhanced Abilities", description: "Powerful ranged enhanced abilities" },
    { url: "/guides/magic/enhanced-abilities", title: "Magic Enhanced Abilities", description: "Powerful magic enhanced abilities" },
  ],
  "ultimate": [
    { url: "/guides/melee/ultimate-abilities", title: "Melee Ultimate Abilities", description: "Most powerful melee abilities" },
    { url: "/guides/range/ultimate-abilities", title: "Ranged Ultimate Abilities", description: "Most powerful ranged abilities" },
    { url: "/guides/magic/ultimate-abilities", title: "Magic Ultimate Abilities", description: "Most powerful magic abilities" },
  ],
  "ultimates": [
    { url: "/guides/melee/ultimate-abilities", title: "Melee Ultimate Abilities", description: "Most powerful melee abilities" },
    { url: "/guides/range/ultimate-abilities", title: "Ranged Ultimate Abilities", description: "Most powerful ranged abilities" },
    { url: "/guides/magic/ultimate-abilities", title: "Magic Ultimate Abilities", description: "Most powerful magic abilities" },
  ],

  // Combat Fundamentals
  "combat": [
    { url: "/getting-started/combat-basics", title: "Combat Basics", description: "Understanding abilities, adrenaline, and combat fundamentals" },
    { url: "/getting-started/combat-options", title: "Combat Options", description: "Configure combat settings and modes" },
    { url: "/getting-started/damage", title: "Damage", description: "How damage is calculated in RuneScape" },
  ],
  "damage": [
    { url: "/getting-started/damage", title: "Damage", description: "How damage is calculated in RuneScape" },
    { url: "/getting-started/combat-triangle", title: "Combat Triangle & Weaknesses", description: "Exploit weaknesses for more damage" },
  ],
  "accuracy": [
    { url: "/getting-started/damage", title: "Damage", description: "Understanding accuracy and hit chance" },
    { url: "/getting-started/combat-triangle", title: "Combat Triangle & Weaknesses", description: "Using weaknesses to improve accuracy" },
  ],
  "weakness": [
    { url: "/getting-started/combat-triangle", title: "Combat Triangle & Weaknesses", description: "Understanding monster weaknesses" },
  ],
  "weaknesses": [
    { url: "/getting-started/combat-triangle", title: "Combat Triangle & Weaknesses", description: "Understanding monster weaknesses" },
  ],
  "critical": [
    { url: "/getting-started/damage", title: "Damage", description: "Critical strike chance and damage" },
  ],
  "crit": [
    { url: "/getting-started/damage", title: "Damage", description: "Critical strike chance and damage" },
  ],
  "adrenaline": [
    { url: "/getting-started/combat-basics", title: "Combat Basics", description: "How adrenaline works with abilities" },
    { url: "/setup/action-bar", title: "Action Bar", description: "Adrenaline display on the action bar" },
  ],

  // Combat Modes
  "revolution": [
    { url: "/getting-started/combat-options/combat-mode", title: "Combat Mode", description: "Revolution auto-casts abilities from your bar" },
  ],
  "revo": [
    { url: "/getting-started/combat-options/combat-mode", title: "Combat Mode", description: "Revolution auto-casts abilities from your bar" },
  ],
  "full manual": [
    { url: "/getting-started/combat-options/combat-mode", title: "Combat Mode", description: "Full manual gives complete control over abilities" },
  ],
  "legacy": [
    { url: "/getting-started/combat-options/combat-mode", title: "Combat Mode", description: "Legacy combat mode (not recommended)" },
  ],

  // Prayers & Curses
  "prayer": [
    { url: "/getting-started/prayers-curses", title: "Prayers & Curses", description: "Using prayers and curses in combat" },
    { url: "/guides/mid-game/ancient-curses", title: "Ancient Curses", description: "Unlock the powerful Ancient Curses prayer book" },
  ],
  "prayers": [
    { url: "/getting-started/prayers-curses", title: "Prayers & Curses", description: "Using prayers and curses in combat" },
  ],
  "curses": [
    { url: "/getting-started/prayers-curses", title: "Prayers & Curses", description: "Using prayers and curses in combat" },
    { url: "/guides/mid-game/ancient-curses", title: "Ancient Curses", description: "Unlock the powerful Ancient Curses prayer book" },
  ],
  "ancient curses": [
    { url: "/guides/mid-game/ancient-curses", title: "Ancient Curses", description: "Unlock the powerful Ancient Curses prayer book" },
  ],
  "soul split": [
    { url: "/getting-started/prayers-curses", title: "Prayers & Curses", description: "Soul Split heals you for damage dealt" },
    { url: "/guides/mid-game/ancient-curses", title: "Ancient Curses", description: "Unlock Soul Split with Ancient Curses" },
  ],
  "turmoil": [
    { url: "/getting-started/prayers-curses", title: "Prayers & Curses", description: "Level 95 damage boosting curses" },
  ],
  "malevolence": [
    { url: "/getting-started/prayers-curses", title: "Prayers & Curses", description: "Level 99 melee curse" },
  ],
  "protection prayer": [
    { url: "/getting-started/prayers-curses", title: "Prayers & Curses", description: "Protection prayers reduce damage by 50%" },
  ],
  "overhead": [
    { url: "/getting-started/prayers-curses", title: "Prayers & Curses", description: "Overhead protection prayers" },
  ],

  // Setup & Interface
  "setup": [
    { url: "/setup", title: "Setup Guide", description: "Get your RuneScape client set up for success" },
    { url: "/setup/interface-setup", title: "Interface Setup", description: "Setting up your RuneScape interface" },
    { url: "/setup/recommended-settings", title: "Recommended Settings", description: "Best RuneScape settings for beginners" },
  ],
  "interface": [
    { url: "/setup/interface-setup", title: "Interface Setup", description: "Setting up your RuneScape interface" },
  ],
  "settings": [
    { url: "/setup/recommended-settings", title: "Recommended Settings", description: "Best RuneScape settings for beginners" },
  ],
  "action bar": [
    { url: "/setup/action-bar", title: "Action Bar", description: "Understanding the action bar" },
    { url: "/getting-started/combat-options/action-bar", title: "Action Bar Settings", description: "Managing combat action bar settings" },
  ],
  "keybinds": [
    { url: "/getting-started", title: "Keybinds", description: "How to set up keybinds for RuneScape" },
  ],
  "keybind": [
    { url: "/getting-started", title: "Keybinds", description: "How to set up keybinds for RuneScape" },
  ],
  "hotkeys": [
    { url: "/getting-started", title: "Keybinds", description: "How to set up keybinds for RuneScape" },
  ],
  "buff bar": [
    { url: "/setup/buff-bar", title: "Buff Bar", description: "Understanding the buff and debuff bars" },
  ],
  "debuff": [
    { url: "/setup/buff-bar", title: "Buff Bar", description: "Understanding the buff and debuff bars" },
  ],
  "minimap": [
    { url: "/setup/map", title: "Minimap and World Map", description: "Navigating the RuneScape minimap" },
  ],
  "map": [
    { url: "/setup/map", title: "Minimap and World Map", description: "Navigating the RuneScape world map" },
  ],
  "lodestone": [
    { url: "/setup/map", title: "Minimap and World Map", description: "Using the Lodestone Network for fast travel" },
  ],
  "chatbox": [
    { url: "/setup/chatbox", title: "Chatbox", description: "Understanding the RuneScape chatbox" },
  ],
  "chat": [
    { url: "/setup/chatbox", title: "Chatbox", description: "Understanding the RuneScape chatbox" },
  ],

  // Account & Game Modes
  "ironman": [
    { url: "/setup/gamemodes", title: "Gamemodes", description: "Ironman and other account types" },
  ],
  "hardcore": [
    { url: "/setup/gamemodes", title: "Gamemodes", description: "Hardcore Ironman mode" },
  ],
  "hcim": [
    { url: "/setup/gamemodes", title: "Gamemodes", description: "Hardcore Ironman mode" },
  ],
  "group ironman": [
    { url: "/setup/gamemodes", title: "Gamemodes", description: "Group Ironman mode" },
  ],
  "gim": [
    { url: "/setup/gamemodes", title: "Gamemodes", description: "Group Ironman mode" },
  ],
  "gamemode": [
    { url: "/setup/gamemodes", title: "Gamemodes", description: "RuneScape account types and gamemodes" },
  ],
  "client": [
    { url: "/setup/client-setup", title: "Client Setup", description: "Download and install the RuneScape client" },
  ],
  "download": [
    { url: "/setup/client-setup", title: "Client Setup", description: "Download and install the RuneScape client" },
  ],
  "launcher": [
    { url: "/setup/client-setup", title: "Client Setup", description: "Using the Jagex Launcher" },
  ],

  // Tick System
  "tick": [
    { url: "/getting-started/tick-system", title: "The Tick System", description: "Understanding RuneScape's 0.6 second tick system" },
  ],
  "ticks": [
    { url: "/getting-started/tick-system", title: "The Tick System", description: "Understanding RuneScape's 0.6 second tick system" },
  ],
  "gcd": [
    { url: "/getting-started/tick-system", title: "The Tick System", description: "Global Cooldown and the tick system" },
  ],
  "global cooldown": [
    { url: "/getting-started/tick-system", title: "The Tick System", description: "Global Cooldown explained" },
  ],

  // Gear
  "gear": [
    { url: "/guides/gear-recommendations", title: "Gear Recommendations", description: "Recommended weapons and armour upgrades" },
    { url: "/guides/gear-recommendations/melee", title: "Melee Gear", description: "Melee weapon and armour recommendations" },
    { url: "/guides/gear-recommendations/ranged", title: "Ranged Gear", description: "Ranged weapon and armour recommendations" },
    { url: "/guides/gear-recommendations/magic", title: "Magic Gear", description: "Magic weapon and armour recommendations" },
  ],
  "weapons": [
    { url: "/guides/gear-recommendations", title: "Gear Recommendations", description: "Recommended weapon upgrades" },
  ],
  "armour": [
    { url: "/guides/gear-recommendations", title: "Gear Recommendations", description: "Recommended armour upgrades" },
  ],
  "armor": [
    { url: "/guides/gear-recommendations", title: "Gear Recommendations", description: "Recommended armour upgrades" },
  ],
  "equipment": [
    { url: "/guides/gear-recommendations", title: "Gear Recommendations", description: "Equipment upgrade recommendations" },
  ],

  // Progression
  "progression": [
    { url: "/guides/early-game", title: "Early Game Progression", description: "Quality of life unlocks and important quests" },
    { url: "/guides/mid-game", title: "Mid Game Progression", description: "Ancient Curses, Invention, and key unlocks" },
    { url: "/guides/late-game", title: "Late Game Progression", description: "Endgame content and boss preparation" },
  ],
  "early game": [
    { url: "/guides/early-game", title: "Early Game Progression", description: "Quality of life unlocks and important quests" },
  ],
  "mid game": [
    { url: "/guides/mid-game", title: "Mid Game Progression", description: "Ancient Curses, Invention, and key unlocks" },
  ],
  "late game": [
    { url: "/guides/late-game", title: "Late Game Progression", description: "Endgame content and boss preparation" },
  ],
  "endgame": [
    { url: "/guides/late-game", title: "Late Game Progression", description: "Endgame content and boss preparation" },
  ],

  // Quests & Unlocks
  "quest": [
    { url: "/guides/early-game", title: "Early Game Progression", description: "Important early game quests" },
    { url: "/guides/mid-game", title: "Mid Game Progression", description: "Key mid game quest unlocks" },
  ],
  "quests": [
    { url: "/guides/early-game", title: "Early Game Progression", description: "Important early game quests" },
    { url: "/guides/mid-game", title: "Mid Game Progression", description: "Key mid game quest unlocks" },
  ],
  "desert treasure": [
    { url: "/guides/early-game/desert-treasure", title: "Desert Treasure", description: "Unlock Ancient Magicks spellbook" },
  ],
  "ancient magicks": [
    { url: "/guides/early-game/desert-treasure", title: "Desert Treasure", description: "Unlock Ancient Magicks spellbook" },
  ],
  "lunar diplomacy": [
    { url: "/guides/early-game/lunar-diplomacy", title: "Lunar Diplomacy", description: "Unlock the Lunar spellbook" },
  ],
  "lunar spellbook": [
    { url: "/guides/early-game/lunar-diplomacy", title: "Lunar Diplomacy", description: "Unlock the Lunar spellbook" },
  ],
  "temple at senntisten": [
    { url: "/guides/mid-game/ancient-curses", title: "Ancient Curses", description: "Unlock Ancient Curses via Temple at Senntisten" },
  ],
  "prifddinas": [
    { url: "/guides/mid-game/prifddinas", title: "Prifddinas", description: "The elven city hub for mid and high-level players" },
  ],
  "prif": [
    { url: "/guides/mid-game/prifddinas", title: "Prifddinas", description: "The elven city hub for mid and high-level players" },
  ],
  "plague's end": [
    { url: "/guides/mid-game/prifddinas", title: "Prifddinas", description: "Unlock Prifddinas via Plague's End" },
  ],
  "extinction": [
    { url: "/guides/late-game/extinction", title: "Extinction", description: "Unlock Ring of Vigour passive and major endgame content" },
  ],
  "ring of vigour": [
    { url: "/guides/late-game/extinction", title: "Extinction", description: "Unlock permanent Ring of Vigour effect" },
  ],

  // Skills & Training
  "invention": [
    { url: "/guides/mid-game/invention", title: "Invention", description: "The elite skill that enhances your gear with perks" },
  ],
  "perks": [
    { url: "/guides/mid-game/invention", title: "Invention", description: "Add powerful perks to your gear" },
  ],
  "augment": [
    { url: "/guides/mid-game/invention", title: "Invention", description: "Augment gear for invention perks" },
  ],
  "slayer": [
    { url: "/guides/mid-game/slayer-helmet", title: "Slayer Helmet", description: "Massive damage boost for Slayer tasks" },
    { url: "/guides/mid-game/smoking-kills", title: "Smoking Kills", description: "Double Slayer points from tasks" },
  ],
  "slayer helmet": [
    { url: "/guides/mid-game/slayer-helmet", title: "Slayer Helmet", description: "Massive damage boost for Slayer tasks" },
  ],
  "smoking kills": [
    { url: "/guides/mid-game/smoking-kills", title: "Smoking Kills", description: "Double Slayer points from tasks" },
  ],
  "ports": [
    { url: "/guides/mid-game/ports", title: "Player Owned Ports", description: "Time-locked progression content" },
  ],
  "player owned ports": [
    { url: "/guides/mid-game/ports", title: "Player Owned Ports", description: "Time-locked progression content" },
  ],
  "training": [
    { url: "/guides", title: "Skill Training Guide", description: "Training recommendations for all skills" },
  ],
  "skills": [
    { url: "/guides", title: "Skill Training Guide", description: "Training recommendations for all skills" },
  ],

  // Potions & Consumables
  "overload": [
    { url: "/guides/late-game/overloads", title: "Overloads", description: "Essential potions for endgame PvM" },
  ],
  "overloads": [
    { url: "/guides/late-game/overloads", title: "Overloads", description: "Essential potions for endgame PvM" },
  ],
  "potion": [
    { url: "/guides/late-game/overloads", title: "Overloads", description: "Essential combat potions" },
  ],
  "potions": [
    { url: "/guides/late-game/overloads", title: "Overloads", description: "Essential combat potions" },
  ],
  "herblore": [
    { url: "/guides/late-game/overloads", title: "Overloads", description: "Create powerful potions with Herblore" },
  ],

  // Boss Content
  "zuk": [
    { url: "/guides/late-game/zuk-cape", title: "Zuk Cape", description: "Best-in-slot capes from TzKal-Zuk" },
  ],
  "zuk cape": [
    { url: "/guides/late-game/zuk-cape", title: "Zuk Cape", description: "Best-in-slot capes from TzKal-Zuk" },
  ],
  "kiln": [
    { url: "/guides/late-game/zuk-cape", title: "Zuk Cape", description: "Fight Kiln and Kiln Cape" },
  ],
  "fight cave": [
    { url: "/guides/late-game/zuk-cape", title: "Zuk Cape", description: "Complete Fight Cave for Fire Cape" },
  ],
  "fire cape": [
    { url: "/guides/late-game/zuk-cape", title: "Zuk Cape", description: "Obtain Fire Cape from Fight Cave" },
  ],
  "boss": [
    { url: "/guides/late-game", title: "Late Game Progression", description: "Endgame boss preparation" },
  ],
  "bossing": [
    { url: "/guides/late-game", title: "Late Game Progression", description: "Endgame boss preparation" },
  ],
  "pvm": [
    { url: "/getting-started/combat-basics", title: "Combat Basics", description: "Learn combat fundamentals for PvM" },
    { url: "/guides/late-game", title: "Late Game Progression", description: "Endgame PvM preparation" },
  ],

  // Necromancy Specific
  "conjures": [
    { url: "/guides/necromancy/conjures", title: "Necromancy Conjures", description: "Summoning undead allies in combat" },
  ],
  "incantations": [
    { url: "/guides/necromancy/incantations", title: "Necromancy Incantations", description: "Powerful Necromancy spells" },
  ],
  "talent tree": [
    { url: "/guides/necromancy/talent-tree", title: "Necromancy Talent Tree", description: "Unlock abilities and buffs" },
  ],

  // Glossary & Reference
  "glossary": [
    { url: "/setup/glossary", title: "Glossary", description: "Common RuneScape terms and abbreviations" },
  ],
  "terms": [
    { url: "/setup/glossary", title: "Glossary", description: "Common RuneScape terms and abbreviations" },
  ],
  "abbreviations": [
    { url: "/setup/glossary", title: "Glossary", description: "Common RuneScape abbreviations" },
  ],
  "wiki": [
    { url: "/setup/runescape-wiki", title: "RuneScape Wiki", description: "Taking advantage of the RuneScape Wiki" },
  ],

  // Getting Started
  "beginner": [
    { url: "/setup", title: "Setup Guide", description: "Complete beginner's setup guide" },
    { url: "/getting-started", title: "Getting Started", description: "Introduction to RuneScape combat" },
  ],
  "new player": [
    { url: "/setup", title: "Setup Guide", description: "Complete beginner's setup guide" },
    { url: "/getting-started", title: "Getting Started", description: "Introduction to RuneScape combat" },
  ],
  "start": [
    { url: "/setup", title: "Setup Guide", description: "Start your RuneScape adventure" },
    { url: "/getting-started", title: "Getting Started", description: "Introduction to RuneScape" },
  ],
  "guide": [
    { url: "/setup", title: "Setup Guide", description: "Complete setup guide" },
    { url: "/guides", title: "Guides", description: "All progression guides" },
  ],
};

/**
 * Searches keywords for matches and returns priority results
 * Supports partial matching and returns results sorted by relevance
 */
export function searchPriorityKeywords(query: string): PriorityResult[] {
  const normalizedQuery = query.toLowerCase().trim();
  
  // Don't flood results with 0-1 character queries
  if (normalizedQuery.length < 1) {
    return [];
  }

  // Exact match first
  if (searchKeywords[normalizedQuery]) {
    return searchKeywords[normalizedQuery];
  }

  // Collect partial matches
  const matches: { keyword: string; results: PriorityResult[]; score: number }[] = [];

  for (const [keyword, results] of Object.entries(searchKeywords)) {
    // Check if query is contained in keyword or keyword is contained in query
    if (keyword.includes(normalizedQuery) || normalizedQuery.includes(keyword)) {
      // Score based on match quality
      let score = 0;
      if (keyword === normalizedQuery) {
        score = 100; // Exact match
      } else if (keyword.startsWith(normalizedQuery)) {
        score = 80; // Prefix match
      } else if (normalizedQuery.startsWith(keyword)) {
        score = 70; // Query contains full keyword
      } else {
        score = 50; // Partial match
      }

      matches.push({ keyword, results, score });
    }
  }

  // Sort by score and flatten results, removing duplicates
  matches.sort((a, b) => b.score - a.score);

  const seen = new Set<string>();
  const uniqueResults: PriorityResult[] = [];

  for (const match of matches) {
    for (const result of match.results) {
      if (!seen.has(result.url)) {
        seen.add(result.url);
        uniqueResults.push(result);
      }
    }
  }

  return uniqueResults;
}

import { describe, expect, it } from "vitest";

import wildernessJson from "./wilderness.json";
import { validateRegionGuideData, wildernessRegionData } from "./region-data";

describe("region guide data", () => {
  it("accepts the fixed Wilderness authoring structure", () => {
    expect(wildernessRegionData.region).toBe("wilderness");
    expect(wildernessRegionData.locations[0].name).toBe("Wilderness Crater");
    expect(wildernessRegionData.pvmUpgrades[0].rows[0]).toEqual(
      expect.objectContaining({
        tier: "75",
        style: "Necromancy",
        items: [
          {
            alsoAvailableIn: [],
            name: "Spectral Spirit Shield",
            note: "",
            url: "https://runescape.wiki/w/Spectral_spirit_shield",
          },
        ],
      }),
    );
  });

  it("rejects generic cell objects and unexpected row fields", () => {
    const invalid = structuredClone(wildernessJson) as unknown as {
      pvmUpgrades: Array<{ rows: Array<Record<string, unknown>> }>;
    };
    invalid.pvmUpgrades[0].rows[0].cells = { tier: "75" };

    expect(() => validateRegionGuideData(invalid)).toThrow(
      "must contain exactly: tier, style, items",
    );
  });
});

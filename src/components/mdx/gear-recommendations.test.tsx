// @vitest-environment jsdom
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { describe, expect, it, vi } from 'vitest';

import { GearRecommendations } from './gear-recommendations';
import {
  PlayerDataContext,
  type PlayerDataContextValue,
} from '@/components/player/player-data-context';
import { TooltipProvider } from '@/components/ui/tooltip';
import type { CombatStyle } from '@/lib/gear-progression';

const playerContext = (levels?: Record<string, number>): PlayerDataContextValue => ({
  playerData: levels ? { username: 'Tester', totalLevel: 1, skills: [], quests: [] } : null,
  loading: false,
  error: null,
  lastSearch: '',
  searchPlayer: vi.fn(),
  getSkillLevel: (skill) => levels?.[skill.toLowerCase()] ?? null,
  isQuestComplete: () => null,
});

function renderGuide(style: CombatStyle, search = '', levels?: Record<string, number>) {
  window.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
  const params = new URLSearchParams(search);
  if (style !== 'necromancy') params.set('style', style);
  return render(
    <MemoryRouter initialEntries={[`/guides/gear-recommendations?${params}`]}>
      <PlayerDataContext.Provider value={playerContext(levels)}>
        <TooltipProvider>
          <GearRecommendations />
        </TooltipProvider>
      </PlayerDataContext.Provider>
    </MemoryRouter>
  );
}

const doll = (container: HTMLElement) =>
  container.querySelector('[data-gear-doll]') as HTMLElement;
const slot = (container: HTMLElement, name: string) =>
  container.querySelector(`[data-gear-slot="${name}"]`) as HTMLElement;

describe('GearRecommendations', () => {
  it('links to all four styles on the same page and keeps the current options', () => {
    renderGuide('melee', '?mode=pvm&tier=90');
    const nav = screen.getByRole('navigation', { name: 'Combat style' });
    expect(within(nav).getByRole('link', { name: 'Necromancy' })).toHaveAttribute(
      'href',
      '/guides/gear-recommendations?mode=pvm&tier=90'
    );
    expect(within(nav).getByRole('link', { name: 'Ranged' })).toHaveAttribute(
      'href',
      '/guides/gear-recommendations?mode=pvm&tier=90&style=ranged'
    );
    expect(within(nav).getByRole('link', { name: 'Melee' })).toHaveAttribute('aria-current', 'page');
  });

  describe('switching style', () => {
    const styleLink = (name: string) =>
      within(screen.getByRole('navigation', { name: 'Combat style' })).getByRole('link', { name });

    it('shows Necromancy by default and for an unknown style', () => {
      const { unmount } = renderGuide('necromancy');
      expect(styleLink('Necromancy')).toHaveAttribute('aria-current', 'page');
      unmount();

      render(
        <MemoryRouter initialEntries={['/guides/gear-recommendations?style=archery']}>
          <PlayerDataContext.Provider value={playerContext()}>
            <TooltipProvider>
              <GearRecommendations />
            </TooltipProvider>
          </PlayerDataContext.Provider>
        </MemoryRouter>
      );
      expect(styleLink('Necromancy')).toHaveAttribute('aria-current', 'page');
    });

    it('changes the gear without losing the upgrade or mode', async () => {
      const user = userEvent.setup();
      const { container } = renderGuide('melee', '?mode=pvm&tier=90');
      expect(within(doll(container)).getByAltText('Main hand: Ruinous rapier')).toBeInTheDocument();

      await user.click(styleLink('Ranged'));

      expect(styleLink('Ranged')).toHaveAttribute('aria-current', 'page');
      expect(container.querySelector('[data-gear-stage]')).toHaveAttribute('data-gear-stage', '90');
      expect(within(doll(container)).getByAltText('Main hand: Noxious longbow')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'PvM (Single Target)' })).toHaveAttribute('aria-pressed', 'true');
    });

    it('keeps the player search and chosen alternatives when switching and coming back', async () => {
      const user = userEvent.setup();
      const { container } = renderGuide('melee', '?mode=pvm&tier=90', { attack: 85 });
      const search = screen.getByPlaceholderText('Load your stats...');
      await user.click(screen.getByRole('button', { name: /^Drygore longsword,/ }));

      await user.click(styleLink('Magic'));
      expect(screen.getByPlaceholderText('Load your stats...')).toBe(search);
      await user.click(styleLink('Melee'));

      expect(within(doll(container)).getByAltText(/^Main hand: Drygore longsword/)).toBeInTheDocument();
    });
  });

  it('switches between training and PvM paths', async () => {
    const user = userEvent.setup();
    const { container } = renderGuide('melee', '?tier=30');
    expect(within(doll(container)).getByAltText('Main hand: Mithril halberd')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'PvM (Single Target)' }));

    expect(within(doll(container)).getByAltText('Main hand: Mithril sword')).toBeInTheDocument();
    expect(within(doll(container)).getByAltText('Off-hand: Mithril off hand sword')).toBeInTheDocument();
  });

  it('hides the mode switch when both paths match', () => {
    renderGuide('magic');
    expect(screen.queryByRole('group', { name: 'Gear purpose' })).not.toBeInTheDocument();
    expect(screen.getByText('Training and PvM use the same upgrades for this style.')).toBeInTheDocument();
  });

  it('puts the upgrade numbers above the style buttons, then the equipment and the table', () => {
    const { container } = renderGuide('melee', '?mode=pvm');
    const order = [
      screen.getByRole('group', { name: 'Gear purpose' }),
      screen.getByRole('list', { name: 'Upgrades' }),
      screen.getByRole('navigation', { name: 'Combat style' }),
      container.querySelector('[data-gear-stage]') as HTMLElement,
      screen.getByRole('region', { name: 'Full Upgrade Order' }),
    ];
    for (const [index, element] of order.slice(1).entries()) {
      expect(order[index].compareDocumentPosition(element) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    }
  });

  it('shows only the equipment, not a second list of the same items', () => {
    const { container } = renderGuide('melee', '?mode=pvm&tier=90');
    expect(container.querySelector('[data-gear-track]')).toBeNull();
    expect(screen.queryByRole('group', { name: /options$/ })).not.toBeInTheDocument();
    expect(container.querySelector('[data-gear-doll]')).not.toBeNull();
  });

  it('has no visible section headings or previous and next buttons', () => {
    renderGuide('melee', '?mode=pvm');
    expect(screen.queryByRole('heading', { name: 'Full Upgrade Order' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Previous' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Next' })).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /^Upgrade 1 of \d+$/ })).toHaveClass('sr-only');
  });

  it('steps through stages with the rail', async () => {
    const user = userEvent.setup();
    renderGuide('melee', '?mode=pvm');
    const total = within(screen.getByRole('list', { name: 'Upgrades' })).getAllByRole('button').length;
    expect(screen.getByRole('heading', { name: `Upgrade 1 of ${total}` })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Upgrade 2: weapon and armour' }));
    expect(screen.getByRole('heading', { name: `Upgrade 2 of ${total}` })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: `Upgrade ${total}: weapon and armour` }));
    expect(screen.getByRole('heading', { name: `Upgrade ${total} of ${total}` })).toBeInTheDocument();
  });

  it('numbers upgrades sequentially and never shows tier labels', () => {
    const { container } = renderGuide('melee', '?mode=pvm&tier=40');
    const rail = screen.getByRole('list', { name: 'Upgrades' });
    const labels = within(rail).getAllByRole('button').map((button) => button.textContent);
    expect(labels).toEqual(labels.map((_, index) => String(index + 1)));
    expect(rail.textContent).not.toMatch(/T\d/);
    const overview = screen.getByRole('region', { name: 'Full Upgrade Order' });
    expect(within(overview).queryByText(/^T\d+$/)).not.toBeInTheDocument();
    expect(container.textContent).not.toMatch(/\bTier\b/);
  });

  it('keeps wearing earlier gear until there is a new piece for that slot', () => {
    const { container } = renderGuide('melee', '?mode=pvm&tier=40');
    expect(within(doll(container)).getByAltText('Body: Mithril platebody')).toBeInTheDocument();
    expect(within(slot(container, 'ring')).getByText(/empty at this upgrade/)).toBeInTheDocument();
  });

  it('marks only the slots upgraded at this step', () => {
    const { container } = renderGuide('melee', '?mode=pvm&tier=40');
    const upgraded = (name: string) => slot(container, name).querySelector('[data-gear-upgraded]');
    expect(upgraded('main')).not.toBeNull();
    expect(upgraded('offhand')).not.toBeNull();
    expect(upgraded('body')).toBeNull();
    expect(within(slot(container, 'main')).getByText('Upgraded at this step')).toBeInTheDocument();
  });

  it('marks nothing at the first upgrade', () => {
    const { container } = renderGuide('melee', '?mode=pvm');
    expect(container.querySelector('[data-gear-upgraded]')).toBeNull();
  });

  it('carries a chosen alternative into later upgrades', async () => {
    const user = userEvent.setup();
    const { container } = renderGuide('melee', '?mode=pvm&tier=90');
    await user.click(screen.getByRole('button', { name: /^Malevolent cuirass/ }));
    await user.click(screen.getByRole('button', { name: /^Upgrade 14:/ }));

    expect(within(doll(container)).getByAltText('Body: Malevolent cuirass')).toBeInTheDocument();
    expect(slot(container, 'body').querySelector('[data-gear-upgraded]')).toBeNull();
  });

  it('lets alternatives in the table drive the equipment', async () => {
    const user = userEvent.setup();
    const { container } = renderGuide('melee', '?mode=pvm&tier=90');
    expect(within(doll(container)).getByAltText('Main hand: Ruinous rapier')).toBeInTheDocument();

    const drygore = screen.getByRole('button', { name: /^Drygore longsword,/ });
    expect(drygore).not.toHaveAttribute('aria-current');
    await user.click(drygore);

    expect(drygore).toHaveAttribute('aria-current', 'true');
    expect(within(doll(container)).getByAltText('Main hand: Drygore longsword')).toBeInTheDocument();
  });

  it('filters to ironman-friendly picks and falls back to a lower tier', async () => {
    const user = userEvent.setup();
    const { container } = renderGuide('ranged', '?mode=pvm&tier=87');
    const stagePanel = () => container.querySelector('[data-gear-stage]');
    expect(stagePanel()).toHaveAttribute('data-gear-stage', '87');

    await user.click(screen.getByRole('switch', { name: 'Ironman-friendly only' }));

    expect(stagePanel()).toHaveAttribute('data-gear-stage', '80');
    expect(screen.queryByText('Decimation Bow')).not.toBeInTheDocument();
    const overview = screen.getByRole('region', { name: 'Full Upgrade Order' });
    expect(within(overview).queryByRole('button', { name: /^Decimation/ })).not.toBeInTheDocument();
  });

  it('names every item in the full order', () => {
    renderGuide('ranged', '?mode=pvm');
    const overview = screen.getByRole('region', { name: 'Full Upgrade Order' });
    for (const name of ['Maple shortbow', 'Bow of the Last Guardian', 'Elite Dracolich hauberk', 'Sirenic hauberk']) {
      expect(within(overview).getByRole('button', { name: new RegExp(`^${name},`) })).toBeInTheDocument();
    }
  });

  describe('full upgrade order', () => {
    const row = (container: HTMLElement, name: string) =>
      container.querySelector(`[data-gear-progression-row="${name}"]`) as HTMLElement;

    it('lists MH, OH and 2H and then a row per armour slot, in upgrade order', () => {
      const { container } = renderGuide('melee', '?mode=pvm');
      const rows = [...container.querySelectorAll('[data-gear-progression-row]')];
      expect(rows.map((item) => item.getAttribute('data-gear-progression-row'))).toEqual([
        'main-hand', 'off-hand', 'two-handed', 'head', 'body', 'legs', 'hands', 'feet',
      ]);
      expect(rows.slice(0, 3).map((item) => item.firstElementChild?.textContent)).toEqual(['MH', 'OH', '2H']);
      const items = within(row(container, 'body')).getAllByRole('button');
      expect(items[0]).toHaveAccessibleName('Bronze platebody, upgrade 1');
      expect(items[1]).toHaveAccessibleName(/^Mithril platebody, upgrade 2, requires 30 Defence/);
    });

    it('numbers its columns like the upgrade rail and marks the current one', () => {
      const { container } = renderGuide('melee', '?mode=pvm&tier=40');
      const rail = within(screen.getByRole('list', { name: 'Upgrades' })).getAllByRole('button');
      const headers = [...container.querySelectorAll('[data-gear-upgrade]')];
      expect(headers.map((header) => header.textContent)).toEqual(rail.map((button) => button.textContent));
      const current = rail.findIndex((button) => button.getAttribute('aria-current') === 'step');
      expect(headers[current]).toHaveClass('bg-primary');
      expect(container.querySelectorAll('[data-gear-upgrade].bg-primary')).toHaveLength(1);
    });

    it('places each item under the upgrade that adds it', () => {
      const { container } = renderGuide('melee', '?mode=pvm');
      const upgradeOf = (id: string, name: RegExp) =>
        Number(within(row(container, id)).getByRole('button', { name }).closest('[data-gear-upgrade-cell]')?.getAttribute('data-gear-upgrade-cell'));
      const body = within(row(container, 'body'));
      for (const button of body.getAllByRole('button')) {
        const upgrade = button.getAttribute('aria-label')?.match(/upgrade (\d+)/)?.[1];
        expect(button.closest('[data-gear-upgrade-cell]')).toHaveAttribute('data-gear-upgrade-cell', upgrade);
      }
      expect(upgradeOf('body', /^Torva platebody/)).toBe(upgradeOf('body', /^Bane platebody/) + 1);
    });

    it('lines the same upgrade up across rows', () => {
      const { container } = renderGuide('melee', '?mode=pvm');
      const column = (id: string, upgrade: number) =>
        (row(container, id).querySelector(`[data-gear-upgrade-cell="${upgrade}"]`) as HTMLElement).style.gridColumn;
      expect(column('main-hand', 1)).toBe('1');
      expect(column('main-hand', 2)).toBe(column('head', 2));
      expect(column('off-hand', 2)).toBe(column('feet', 2));
    });

    it('splits weapons into main hand, off-hand and two-handed rows', () => {
      const { container } = renderGuide('melee', '?mode=pvm');
      const inRow = (id: string) => within(row(container, id));
      expect(inRow('main-hand').getByRole('button', { name: /^Dragon scimitar,/ })).toBeInTheDocument();
      expect(inRow('off-hand').getByRole('button', { name: /^Off-hand dragon scimitar,/ })).toBeInTheDocument();
      expect(inRow('two-handed').getByRole('button', { name: /^Vanquish/ })).toBeInTheDocument();
      expect(inRow('main-hand').queryByRole('button', { name: /^Vanquish/ })).not.toBeInTheDocument();
    });

    it('keeps one-handed weapons with no listed off-hand in the MH row', () => {
      const { container } = renderGuide('melee', '?mode=pvm');
      for (const name of [/^Necronium battleaxe/, /^Abyssal scourge/]) {
        expect(within(row(container, 'main-hand')).getByRole('button', { name })).toBeInTheDocument();
        expect(within(row(container, 'two-handed')).queryByRole('button', { name })).not.toBeInTheDocument();
      }
    });

    it('leaves a slot blank at upgrades that do not change it', () => {
      const { container } = renderGuide('melee', '?mode=pvm');
      const upgrades = (id: string) =>
        [...row(container, id).querySelectorAll('[data-gear-upgrade-cell]')].map((cell) => cell.getAttribute('data-gear-upgrade-cell'));
      expect(upgrades('body')).not.toContain('3');
      expect(upgrades('main-hand')).toContain('3');
    });

    it('highlights each hand and lists a shared item once', () => {
      const { container } = renderGuide('ranged', '?tier=92');
      const current = (id: string) => within(row(container, id)).getByRole('button', { current: true });
      expect(current('main-hand')).toHaveAccessibleName(/^Mechanised chinchompa/);
      expect(current('off-hand')).toHaveAccessibleName(/^Off-hand Blightbound crossbow/);
      expect(within(row(container, 'main-hand')).getAllByRole('button', { name: /^Mechanised chinchompa/ })).toHaveLength(1);
    });

    it('greys only the hand the player is missing levels for', () => {
      const { container } = renderGuide('ranged', '', { ranged: 80, defence: 99 });
      const item = (id: string, name: RegExp) => within(row(container, id)).getByRole('button', { name });
      expect(item('main-hand', /^Mechanised chinchompa/).querySelector('.grayscale')).toBeNull();
      expect(item('off-hand', /^Off-hand Blightbound crossbow/).querySelector('.grayscale')).not.toBeNull();
    });

    it('groups alternatives at one step with OR', () => {
      const { container } = renderGuide('melee', '?mode=pvm');
      const body = within(row(container, 'body'));
      const step = body.getByRole('button', { name: /^Malevolent cuirass/ }).closest('[data-gear-upgrade-cell]') as HTMLElement;
      expect(within(step).getByRole('button', { name: /^Masterwork melee platebody/ })).toBeInTheDocument();
      expect(within(step).getByText('OR')).toBeInTheDocument();
    });

    it('highlights what is worn in each slot, including carried items', () => {
      const { container } = renderGuide('melee', '?mode=pvm&tier=40');
      const current = within(row(container, 'body')).getByRole('button', { current: true });
      expect(current).toHaveAccessibleName(/^Mithril platebody/);
    });

    it('selects the clicked alternative and its upgrade', async () => {
      const user = userEvent.setup();
      const { container } = renderGuide('melee', '?mode=pvm');
      await user.click(within(row(container, 'body')).getByRole('button', { name: /^Malevolent cuirass/ }));

      expect(within(doll(container)).getByAltText('Body: Malevolent cuirass')).toBeInTheDocument();
      expect(within(row(container, 'body')).getByRole('button', { current: true })).toHaveAccessibleName(/^Malevolent cuirass/);
    });

    it('greys items above the player levels', () => {
      const { container } = renderGuide('melee', '?mode=pvm', { attack: 60, strength: 60, defence: 50 });
      const body = within(row(container, 'body'));
      expect(body.getByRole('button', { name: /^Rune platebody/ }).querySelector('.grayscale')).toBeNull();
      expect(body.getByRole('button', { name: /^Torva platebody/ }).querySelector('.grayscale')).not.toBeNull();
    });
  });

  it('replaces a failed image with labelled initials', () => {
    const { container } = renderGuide('melee', '?tier=30');
    const image = within(doll(container)).getByAltText('Main hand: Mithril halberd');
    fireEvent.error(image);

    expect(within(doll(container)).queryByAltText('Main hand: Mithril halberd')).not.toBeInTheDocument();
    expect(within(doll(container)).getByRole('img', { name: 'Main hand: Mithril halberd' })).toHaveTextContent('MH');
  });

  it('selects from the full order without moving the page or focus', async () => {
    const user = userEvent.setup();
    const scrollIntoView = vi.fn();
    Element.prototype.scrollIntoView = scrollIntoView;
    renderGuide('melee', '?mode=pvm');
    const overview = screen.getByRole('region', { name: 'Full Upgrade Order' });
    const item = within(overview).getByRole('button', { name: /^Dragon scimitar/ });

    await user.click(item);

    expect(screen.getByRole('heading', { name: /^Upgrade 5 of \d+$/ })).toBeInTheDocument();
    expect(scrollIntoView).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(item);
  });

  describe('item dependencies', () => {
    const fullOrder = () => within(screen.getByRole('region', { name: 'Full Upgrade Order' }));
    const gloves = () => fullOrder().getByRole('button', { name: /^Cinderbane gloves/ });
    const bracelet = () => fullOrder().getByRole('button', { name: /^Deathtouch bracelet/ });
    const visage = () => fullOrder().getByRole('button', { name: /^Visage of the First Necromancer/ });

    it('marks only the dependent items in the full order', () => {
      const { container } = renderGuide('necromancy');
      expect(gloves().querySelector('[data-gear-dependency-marker]')).not.toBeNull();
      expect(bracelet().querySelector('[data-gear-dependency-marker]')).not.toBeNull();
      expect(visage().querySelector('[data-gear-dependency-marker]')).toBeNull();
      expect(container.querySelectorAll('[data-gear-progression-row] [data-gear-dependency-marker]')).toHaveLength(2);
    });

    it('offers the bracelet as an optional alternative, with the gloves as the default', async () => {
      const user = userEvent.setup();
      const { container } = renderGuide('necromancy', '?tier=95.2');
      const cell = gloves().closest('[data-gear-upgrade-cell]') as HTMLElement;
      expect(within(cell).getByRole('button', { name: /^Deathtouch bracelet/ })).toBeInTheDocument();
      expect(within(cell).getByText('OR')).toBeInTheDocument();
      expect(within(doll(container)).getByAltText('Hands: Cinderbane gloves')).toBeInTheDocument();

      await user.click(bracelet());
      expect(within(doll(container)).getByAltText('Hands: Deathtouch bracelet')).toBeInTheDocument();
      expect(within(doll(container)).getByAltText('Head: Visage of the First Necromancer')).toBeInTheDocument();
    });

    it('never greys the bracelet, which has no requirements', () => {
      renderGuide('necromancy', '', { defence: 1, necromancy: 1 });
      expect(bracelet().querySelector('.grayscale')).toBeNull();
      expect(gloves().querySelector('.grayscale')).not.toBeNull();
    });

    it('puts the dependency and the item it unlocks in consecutive upgrades', () => {
      renderGuide('necromancy');
      const upgrade = (button: HTMLElement) =>
        Number(button.closest('[data-gear-upgrade-cell]')?.getAttribute('data-gear-upgrade-cell'));
      const crown = fullOrder().getByRole('button', { name: /^Crown of the First Necromancer/ });
      expect(upgrade(visage())).toBe(upgrade(crown) + 1);
      expect(upgrade(gloves())).toBe(upgrade(visage()) + 1);
    });

    it('says what it depends on, and why, on hover', async () => {
      const user = userEvent.setup();
      renderGuide('necromancy');
      await user.hover(gloves());
      const tooltip = await screen.findByRole('tooltip');
      expect(tooltip).toHaveTextContent('Cinderbane gloves');
      expect(tooltip).toHaveTextContent('Only after: Visage of the First Necromancer');
      expect(tooltip).toHaveTextContent('5-piece set effect');
    });

    it('labels the bracelet as optional on hover', async () => {
      const user = userEvent.setup();
      renderGuide('necromancy');
      await user.hover(bracelet());
      expect(await screen.findByRole('tooltip')).toHaveTextContent('Optional');
    });

    it('keeps other tooltips to just the name', async () => {
      const user = userEvent.setup();
      renderGuide('necromancy');
      await user.hover(fullOrder().getByRole('button', { name: /^Crown of the First Necromancer/ }));
      expect(await screen.findByRole('tooltip')).toHaveTextContent(/^Crown of the First Necromancer$/);
    });

    it('highlights the dependency only while hovering the item', async () => {
      const user = userEvent.setup();
      renderGuide('necromancy');
      expect(visage()).not.toHaveAttribute('data-gear-dependency-highlight');
      await user.hover(gloves());
      expect(visage()).toHaveAttribute('data-gear-dependency-highlight');
      await user.unhover(gloves());
      expect(visage()).not.toHaveAttribute('data-gear-dependency-highlight');
    });

    it('swaps only the gloves into the equipment slots, keeping the rest of the set', () => {
      const { container } = renderGuide('necromancy', '?tier=95.2');
      expect(within(doll(container)).getByAltText('Hands: Cinderbane gloves')).toBeInTheDocument();
      expect(within(doll(container)).getByAltText('Head: Visage of the First Necromancer')).toBeInTheDocument();
      expect(within(doll(container)).getByAltText('Feet: Foot wraps of the First Necromancer')).toBeInTheDocument();
      expect(slot(container, 'hands').querySelector('[data-gear-upgraded]')).not.toBeNull();
      expect(slot(container, 'feet').querySelector('[data-gear-upgraded]')).toBeNull();
    });

    it('opens the right upgrade from a shared link', () => {
      const { container } = renderGuide('necromancy', '?tier=95.1');
      expect(container.querySelector('[data-gear-stage]')).toHaveAttribute('data-gear-stage', '95.1');
      expect(within(doll(container)).getByAltText('Head: Visage of the First Necromancer')).toBeInTheDocument();
    });
  });

  describe('tooltips', () => {
    const fullOrderItem = (name: RegExp) =>
      within(screen.getByRole('region', { name: 'Full Upgrade Order' })).getByRole('button', { name });

    it('replaces native browser tooltips', () => {
      const { container } = renderGuide('melee', '?mode=pvm&tier=90');
      expect(container.querySelector('[data-gear-progression] [title]')).toBeNull();
    });

    it('only names the item, after a short delay', async () => {
      const user = userEvent.setup();
      renderGuide('melee', '?mode=pvm');
      await user.hover(fullOrderItem(/^Torva platebody/));
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
      expect(await screen.findByRole('tooltip')).toHaveTextContent(/^Torva platebody$/);
    });

    it('names the item in an equipment slot', async () => {
      const user = userEvent.setup();
      const { container } = renderGuide('melee', '?mode=pvm&tier=40');
      await user.hover(slot(container, 'main').firstElementChild as HTMLElement);
      expect(await screen.findByRole('tooltip')).toHaveTextContent(/^Adamant sword$/);
    });

    it('disappears as soon as the pointer leaves the item', async () => {
      const user = userEvent.setup();
      renderGuide('melee', '?mode=pvm');
      const item = fullOrderItem(/^Torva platebody/);
      await user.hover(item);
      await screen.findByRole('tooltip');
      await user.unhover(item);
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });

    it('never appears if the pointer leaves during the delay', async () => {
      const user = userEvent.setup();
      renderGuide('melee', '?mode=pvm');
      const item = fullOrderItem(/^Torva platebody/);
      await user.hover(item);
      await user.unhover(item);
      await new Promise((resolve) => setTimeout(resolve, 300));
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });

    it('closes on click rather than lingering over the panel', async () => {
      const user = userEvent.setup();
      renderGuide('melee', '?mode=pvm');
      const item = fullOrderItem(/^Torva platebody/);
      await user.hover(item);
      await screen.findByRole('tooltip');
      await user.click(item);
      await new Promise((resolve) => setTimeout(resolve, 300));
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });

    it('switches to the next item when moving between them', async () => {
      const user = userEvent.setup();
      const { container } = renderGuide('melee', '?mode=pvm&tier=40');
      await user.hover(slot(container, 'main').firstElementChild as HTMLElement);
      expect(await screen.findByRole('tooltip')).toHaveTextContent('Adamant sword');

      await user.unhover(slot(container, 'main').firstElementChild as HTMLElement);
      await user.hover(slot(container, 'body').firstElementChild as HTMLElement);
      await waitFor(() => expect(screen.getByRole('tooltip')).toHaveTextContent('Mithril platebody'));
    });

    it('adds an item note to its name', async () => {
      const user = userEvent.setup();
      renderGuide('necromancy');
      await user.hover(fullOrderItem(/^Visage of the First Necromancer/));
      const tooltip = await screen.findByRole('tooltip');
      expect(tooltip).toHaveTextContent('Visage of the First Necromancer');
      expect(tooltip).toHaveTextContent("Crown + Misalionar's Death Mask");
    });

    it('names the example item a set is shown with', async () => {
      const user = userEvent.setup();
      renderGuide('melee', '?mode=pvm');
      await user.hover(fullOrderItem(/^Dharok's platebody/));
      expect(await screen.findByRole('tooltip')).toHaveTextContent("Example set shown: Dharok's");
    });

    it('opens on tap for touch screens, and closes on a tap elsewhere', async () => {
      const user = userEvent.setup();
      const { container } = renderGuide('necromancy', '?tier=95.2');
      const gloves = fullOrderItem(/^Cinderbane gloves/);
      await user.pointer([{ keys: '[TouchA]', target: gloves }]);

      const tooltip = await screen.findByRole('tooltip');
      expect(tooltip).toHaveTextContent('Only after: Visage of the First Necromancer');
      expect(within(doll(container)).getByAltText('Hands: Cinderbane gloves')).toBeInTheDocument();

      await user.pointer([{ keys: '[TouchA]', target: document.body }]);
      await waitFor(() => expect(screen.queryByRole('tooltip')).not.toBeInTheDocument());
    });

    it('still shows for keyboard users', async () => {
      const user = userEvent.setup();
      renderGuide('melee', '?mode=pvm');
      const item = fullOrderItem(/^Bronze platebody/);
      while (document.activeElement !== item) await user.tab();
      expect(await screen.findByRole('tooltip')).toHaveTextContent(/^Bronze platebody$/);
    });
  });

  describe('player levels', () => {
    it('shows the lookup above the guide and greys nothing without a player', () => {
      const { container } = renderGuide('melee', '?mode=pvm&tier=90');
      expect(screen.getByPlaceholderText('Load your stats...')).toBeInTheDocument();
      expect(container.querySelector('.grayscale')).toBeNull();
      expect(within(doll(container)).getByAltText('Main hand: Ruinous rapier')).toBeInTheDocument();
    });

    it('greys out gear above the player levels and says what is missing', async () => {
      const user = userEvent.setup();
      const { container } = renderGuide('melee', '?mode=pvm&tier=90', { attack: 85, defence: 90 });
      const weapon = within(doll(container)).getByAltText('Main hand: Ruinous rapier, requires 90 Attack');
      expect(weapon.closest('.grayscale')).not.toBeNull();
      const armour = within(doll(container)).getByAltText('Body: Masterwork melee platebody');
      expect(armour.closest('.grayscale')).toBeNull();

      await user.hover(slot(container, 'main').firstElementChild as HTMLElement);
      const tooltip = await screen.findByRole('tooltip');
      expect(tooltip).toHaveTextContent('Ruinous rapier');
      expect(tooltip).toHaveTextContent('Needs 90 Attack');
    });

    it('counts every skill a piece needs, not just the combat skill', () => {
      const { container } = renderGuide('melee', '?tier=80', { attack: 99, defence: 99, constitution: 70 });
      expect(within(doll(container)).getByAltText('Body: Torva platebody, requires 80 Constitution')).toBeInTheDocument();
    });

    it('greys single pieces when a pick mixes levels', () => {
      const { container } = renderGuide('ranged', '?tier=92', { ranged: 80, defence: 99 });
      expect(within(doll(container)).getByAltText('Main hand: Mechanised chinchompa')).toBeInTheDocument();
      expect(within(doll(container)).getByAltText('Off-hand: Off-hand Blightbound crossbow, requires 92 Ranged')).toBeInTheDocument();
    });

    it('marks upgrades only when nothing in them can be worn, and keeps them selectable', async () => {
      const user = userEvent.setup();
      renderGuide('melee', '?mode=pvm', { attack: 60, strength: 60, defence: 50 });
      const rail = screen.getByRole('list', { name: 'Upgrades' });
      const buttons = within(rail).getAllByRole('button');
      expect(buttons[0]).not.toHaveAccessibleName(/levels too low/);
      const last = buttons[buttons.length - 1];
      expect(last).toHaveAccessibleName(/levels too low/);

      await user.click(last);
      expect(last).toHaveAttribute('aria-current', 'step');
    });

    it('does not grey out gear when the player level is unknown', () => {
      const { container } = renderGuide('melee', '?tier=30', {});
      expect(within(doll(container)).getByAltText('Main hand: Mithril halberd')).toBeInTheDocument();
      expect(container.querySelector('.grayscale')).toBeNull();
    });
  });
});

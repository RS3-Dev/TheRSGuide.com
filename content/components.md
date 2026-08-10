# Common JSX Components

This document describes the common JSX components available for use in MDX files throughout the repository.

## Cards Component

The `Cards` component is used to display a group of card links. It wraps one or more `Card` components.

### Usage

```mdx
<Cards>
  <Card
    title="Learn more about RuneScape"
    href="https://runescape.wiki"
  />
  <Card
    title="Official RuneScape Website"
    href="https://www.runescape.com"
  />
</Cards>
```

### Card Component Properties

- `title` (required): The text displayed on the card
- `href` (required): The URL the card links to

### Example

Here's a real example from the repository:

```mdx
<Cards>
  <Card title="Learn more about RuneScape" href="https://runescape.wiki" />
  <Card title="Official RuneScape Website" href="https://www.runescape.com" />
</Cards>
```

## UnderConstruction Component

Wrap unfinished MDX in `UnderConstruction` to show a compact construction notice
above the work in progress:

```mdx
<UnderConstruction>

# Unfinished guide

Continue writing the page normally inside the wrapper.

</UnderConstruction>
```

The wrapped content remains visible beneath the notice. For a page without any
content yet, use a self-closing component to show only **Pages under
construction**:

```mdx
<UnderConstruction />
```

## Static Leagues Picks

Use `StaticRelicPicks` and `StaticBlessingPicks` to show a recommended build
without allowing readers to change its selections. Each component shows only
the selected picks in the same compact grid used by the picker share image.
The tiles appear four across on larger screens and two across on mobile. Readers
can select a tile to open its details, but they cannot change the build.

Relic picks are keyed by tier. Relic names are recommended for readability,
though picker IDs such as `1a` are also accepted. When a path includes
Rejuvenated, use `rejuvenatedRelic` to specify its additional pick:

```mdx
<StaticRelicPicks
  ariaLabel="Skilling relic path"
  picks={{
    1: "Endless Harvest",
    2: "Superheated",
    3: "Voidwalker",
    4: "Crystal Grace",
    5: "Devout",
    6: "Rejuvenated",
    7: "Infernal Fire",
  }}
  rejuvenatedRelic="Assassin's Insight"
/>
```

Blessing picks are keyed by their selectable tiers. Use `Order`, `Balance`, or
`Chaos`; God Tiers 4 and 8 are derived automatically from the preceding picks:

```mdx
<StaticBlessingPicks
  ariaLabel="Skilling blessing path"
  picks={{
    1: "Order",
    2: "Chaos",
    3: "Balance",
    5: "Order",
    6: "Chaos",
    7: "Balance",
  }}
/>
```

## Need More Components?

If you need to use a component that isn't documented here, or if you're unsure how to use a component:

- Open an issue on GitHub asking about the component
- Check existing MDX files in the repository for examples
- Ask in your pull request description - we're happy to help!


"use client";

import type { ReactNode } from "react";
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronRight, Hash } from "lucide-react";
import { useRouter } from "next/navigation";
import type { HighlightedText } from "fumadocs-core/search";
import { useDocsSearch } from "fumadocs-core/search/client";
import {
  SearchDialog,
  SearchDialogClose,
  SearchDialogContent,
  SearchDialogFooter,
  SearchDialogHeader,
  SearchDialogIcon,
  SearchDialogInput,
  SearchDialogOverlay,
  TagsList,
  TagsListItem,
  type SearchItemType,
  type SharedProps,
} from "fumadocs-ui/components/dialog/search";
import type { SearchLink, TagItem } from "fumadocs-ui/contexts/search";
import { useI18n } from "fumadocs-ui/contexts/i18n";
import { cn } from "fumadocs-ui/utils/cn";

interface StableSearchDialogProps extends SharedProps {
  defaultTag?: string;
  tags?: TagItem[];
  api?: string;
  delayMs?: number;
  type?: "fetch" | "static";
  allowClear?: boolean;
  links?: SearchLink[];
  footer?: ReactNode;
}

export function StableSearchDialog({
  defaultTag,
  tags = [],
  api,
  delayMs,
  type = "fetch",
  allowClear = false,
  links = [],
  footer,
  ...props
}: StableSearchDialogProps) {
  const { locale } = useI18n();
  const [tag, setTag] = useState(defaultTag);
  const { search, setSearch, query } = useDocsSearch(
    type === "fetch"
      ? {
          type: "fetch",
          api,
          locale,
          tag,
          delayMs,
        }
      : {
          type: "static",
          from: api,
          locale,
          tag,
          delayMs,
        },
  );

  const defaultItems = useMemo<SearchItemType[] | null>(() => {
    if (links.length === 0) return null;

    return links.map(([name, link]) => ({
      type: "page",
      id: name,
      content: name,
      url: link,
    }));
  }, [links]);

  useEffect(() => {
    setTag(defaultTag);
  }, [defaultTag]);

  return (
    <SearchDialog
      search={search}
      onSearchChange={setSearch}
      isLoading={query.isLoading}
      {...props}
    >
      <SearchDialogOverlay />
      <SearchDialogContent>
        <SearchDialogHeader>
          <SearchDialogIcon />
          <SearchDialogInput />
          <SearchDialogClose />
        </SearchDialogHeader>
        <StableSearchDialogList
          items={query.data !== "empty" ? query.data : defaultItems}
          onOpenChange={props.onOpenChange}
        />
      </SearchDialogContent>
      <SearchDialogFooter>
        {tags.length > 0 && (
          <TagsList tag={tag} onTagChange={setTag} allowClear={allowClear}>
            {tags.map((tag) => (
              <TagsListItem key={tag.value} value={tag.value}>
                {tag.name}
              </TagsListItem>
            ))}
          </TagsList>
        )}
        {footer}
      </SearchDialogFooter>
    </SearchDialog>
  );
}

function StableSearchDialogList({
  items = null,
  onOpenChange,
}: {
  items: SearchItemType[] | null | undefined;
  onOpenChange: (open: boolean) => void;
}) {
  const { text } = useI18n();
  const ref = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState(() =>
    items && items.length > 0 ? items[0].id : null,
  );
  const router = useRouter();

  const openItem = useCallback(
    (item: SearchItemType) => {
      if (item.type === "action") {
        item.onSelect();
      } else if (item.external) {
        window.open(item.url, "_blank")?.focus();
      } else {
        router.push(item.url);
      }

      onOpenChange(false);
    },
    [onOpenChange, router],
  );

  useEffect(() => {
    setActive(items && items.length > 0 ? items[0].id : null);
  }, [items]);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const viewport = element.firstElementChild;
    const observer = new ResizeObserver(() => {
      if (viewport) {
        element.style.setProperty(
          "--fd-animated-height",
          `${viewport.clientHeight}px`,
        );
      }
    });

    if (viewport) observer.observe(viewport);

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!items || items.length === 0 || event.isComposing) return;

      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        const direction = event.key === "ArrowDown" ? 1 : -1;
        const currentIndex = items.findIndex((item) => item.id === active);
        const nextIndex =
          currentIndex === -1
            ? 0
            : (currentIndex + direction + items.length) % items.length;

        setActive(items[nextIndex]?.id ?? null);
        event.preventDefault();
      }

      if (event.key === "Enter") {
        const selected = items.find((item) => item.id === active);
        if (selected) openItem(selected);
        event.preventDefault();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [active, items, openItem]);

  return (
    <div
      ref={ref}
      data-empty={items === null}
      className="overflow-hidden h-(--fd-animated-height) transition-[height]"
    >
      <div
        className={cn(
          "w-full flex flex-col overflow-y-auto max-h-[460px] p-1",
          !items && "hidden",
        )}
      >
        {items?.length === 0 && (
          <div className="py-12 text-center text-sm text-fd-muted-foreground">
            {text.searchNoResult}
          </div>
        )}
        {items?.map((item) => (
          <StableSearchDialogListItem
            key={item.id}
            item={item}
            active={item.id === active}
            onActiveChange={setActive}
            onClick={() => openItem(item)}
          />
        ))}
      </div>
    </div>
  );
}

function StableSearchDialogListItem({
  item,
  active,
  onActiveChange,
  onClick,
}: {
  item: SearchItemType;
  active: boolean;
  onActiveChange: (value: string | null) => void;
  onClick: () => void;
}) {
  const ref = useCallback(
    (element: HTMLButtonElement | null) => {
      if (!active || !element) return;

      element.scrollIntoView({
        block: "nearest",
      });
    },
    [active],
  );

  return (
    <button
      type="button"
      ref={ref}
      aria-selected={active}
      className={cn(
        "relative select-none px-2.5 py-2 text-start text-sm rounded-lg",
        active && "bg-fd-accent text-fd-accent-foreground",
      )}
      onPointerMove={() => onActiveChange(item.id)}
      onClick={onClick}
    >
      {item.type === "action" ? item.node : <SearchResultContent item={item} />}
    </button>
  );
}

function SearchResultContent({
  item,
}: {
  item: Exclude<SearchItemType, { type: "action" }>;
}) {
  return (
    <>
      <div className="inline-flex items-center text-fd-muted-foreground text-xs empty:hidden">
        {item.breadcrumbs?.map((breadcrumb, index) => (
          <Fragment key={index}>
            {index > 0 && <ChevronRight className="size-4" />}
            {breadcrumb}
          </Fragment>
        ))}
      </div>
      {item.type !== "page" && (
        <div
          role="none"
          className="absolute start-3 inset-y-0 w-px bg-fd-border"
        />
      )}
      <p
        className={cn(
          "min-w-0 truncate",
          item.type !== "page" && "ps-4",
          item.type === "page" || item.type === "heading"
            ? "font-medium"
            : "text-fd-popover-foreground/80",
        )}
      >
        {item.type === "heading" && (
          <Hash className="inline me-1 size-4 text-fd-muted-foreground" />
        )}
        {item.contentWithHighlights
          ? renderHighlights(item.contentWithHighlights)
          : item.content}
      </p>
    </>
  );
}

function renderHighlights(highlights: HighlightedText<ReactNode>[]) {
  return highlights.map((node, index) => {
    if (node.styles?.highlight) {
      return (
        <span key={index} className="text-fd-primary underline">
          {node.content}
        </span>
      );
    }

    return <Fragment key={index}>{node.content}</Fragment>;
  });
}

import React, { useEffect, useState } from "react";
import { evaluate } from "@mdx-js/mdx";
import { useMDXComponents } from "@mdx-js/react";
import * as runtime from "react/jsx-runtime";

/**
 * WARNING: This component should be used sparingly and with intention.
 * This will compile and render MDX strings passed in as content, and
 * should only be used with trusted, validated inputs. Don't use this
 * component if you're not sure of the content's source.
 */

type MdxContentProps = { content: string };
export const MdxContent: React.FC<MdxContentProps> = ({ content }) => {
  const exports = useMDXContent(content);
  return <exports.default />;
};

function useMDXContent(content: string) {
  const [exports, setExports] = useState<{ default: React.FC }>({ default: runtime.Fragment });

  useEffect(() => {
    evaluate(content, { ...runtime, useMDXComponents }).then((exports) =>
      setExports({ default: exports.default as typeof runtime.Fragment})
    );
  }, [content]);

  return exports;
}

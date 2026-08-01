import React, { useEffect, useState } from "react";
import { evaluate } from "@mdx-js/mdx";
import { useMDXComponents } from "@mdx-js/react";
import * as runtime from "react/jsx-runtime";

type MdxContentProps = { content: string };
export const MdxContent: React.FC<MdxContentProps> = ({ content }) => {
  const exports = useMDXContent(content);
  const Content = exports.default;
  return <Content />;
};

function useMDXContent(content: string) {
  const [exports, setExports] = useState({ default: runtime.Fragment });

  useEffect(() => {
    evaluate(content, { ...runtime, useMDXComponents }).then((exports) =>
      setExports({ default: exports.default as typeof runtime.Fragment})
    );
  }, [content]);

  return exports;
}

"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function MarkdownView({ content }: { content: string }) {
  return (
    <div className="text-sm leading-relaxed prose prose-sm max-w-none dark:prose-invert [&>*]:mb-3 [&_h1]:text-base [&_h1]:font-semibold [&_h2]:text-sm [&_h2]:font-semibold [&_h3]:text-sm [&_h3]:font-medium [&_ul]:ml-4 [&_ol]:ml-4 [&_li]:mb-1">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ node, ...props }) => (
            <h2 {...props} className="text-base font-semibold" />
          ),
          h2: ({ node, ...props }) => (
            <h3 {...props} className="text-sm font-semibold" />
          ),
          h3: ({ node, ...props }) => (
            <h4 {...props} className="text-sm font-medium" />
          ),
          ul: ({ node, ...props }) => (
            <ul {...props} className="list-disc ml-4" />
          ),
          ol: ({ node, ...props }) => (
            <ol {...props} className="list-decimal ml-4" />
          ),
          li: ({ node, ...props }) => <li {...props} className="mb-1" />,
          p: ({ node, ...props }) => <p {...props} className="mb-2" />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

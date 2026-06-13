import React from 'react';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

interface Props {
  text: string;
}

export default function CFMathText({ text }: Props) {
  if (!text) return null;

  // Split by $$$...$$$ or $$...$$
  const parts = text.split(/(\$\$\$[\s\S]*?\$\$\$|\$\$[\s\S]*?\$\$)/g);

  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith('$$$') && part.endsWith('$$$')) {
          const math = part.slice(3, -3);
          return <InlineMath key={index} math={math} />;
        } else if (part.startsWith('$$') && part.endsWith('$$')) {
          const math = part.slice(2, -2);
          return <BlockMath key={index} math={math} />;
        } else {
          return <span key={index}>{part}</span>;
        }
      })}
    </>
  );
}

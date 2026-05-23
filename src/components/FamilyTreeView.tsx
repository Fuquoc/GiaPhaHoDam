'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import dynamic from 'next/dynamic';
import type { TreeNode } from '@/lib/buildTree';
import type { RawNodeDatum, CustomNodeElementProps } from 'react-d3-tree';

// react-d3-tree uses DOM APIs — must be dynamically imported on client
const Tree = dynamic(() => import('react-d3-tree').then((m) => m.Tree), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full text-gray-400 text-sm">
      Đang tải cây gia phả...
    </div>
  ),
});

interface Props {
  treeData: TreeNode;
}

interface PersonNodeProps extends CustomNodeElementProps {
  onPersonClick: (id: string) => void;
}

type NodeAttrs = TreeNode['attributes'];

function PersonNode({ nodeDatum, onPersonClick }: PersonNodeProps) {
  const d = nodeDatum as unknown as { name: string; attributes: NodeAttrs };
  const isMale = d.attributes?.gender === 'male';
  const isFemale = d.attributes?.gender === 'female';

  const bgColor = isMale ? '#dbeafe' : isFemale ? '#fce7f3' : '#f3f4f6';
  const borderColor = isMale ? '#3b82f6' : isFemale ? '#ec4899' : '#9ca3af';

  const hasSpouse = Boolean(d.attributes?.spouse);
  const hasYears = Boolean(d.attributes?.years);

  const cardW = 148;
  const cardH = hasSpouse ? (hasYears ? 64 : 50) : hasYears ? 48 : 36;

  return (
    <g
      onClick={() => d.attributes?.id && onPersonClick(String(d.attributes.id))}
      style={{ cursor: 'pointer' }}
    >
      <rect
        x={-cardW / 2}
        y={-cardH / 2}
        width={cardW}
        height={cardH}
        rx={8}
        ry={8}
        fill={bgColor}
        stroke={borderColor}
        strokeWidth={1.5}
      />

      {/* Name */}
      <text
        x={0}
        y={hasSpouse || hasYears ? -cardH / 2 + 16 : 4}
        textAnchor="middle"
        fill="#111827"
        fontSize={12}
        fontWeight="400"
        fontFamily="system-ui, sans-serif"
        textRendering="geometricPrecision"
      >
        {d.name.length > 21 ? d.name.slice(0, 20) + '…' : d.name}
      </text>

      {/* Spouse */}
      {hasSpouse && (
        <text
          x={0}
          y={-cardH / 2 + 32}
          textAnchor="middle"
          fill="#6b7280"
          fontSize={9}
          fontFamily="system-ui, sans-serif"
          textRendering="geometricPrecision"
        >
          ♥ {String(d.attributes.spouse).length > 23
            ? String(d.attributes.spouse).slice(0, 22) + '…'
            : d.attributes.spouse}
        </text>
      )}

      {/* Years */}
      {hasYears && (
        <text
          x={0}
          y={cardH / 2 - 8}
          textAnchor="middle"
          fill="#9ca3af"
          fontSize={9}
          fontFamily="system-ui, sans-serif"
          textRendering="geometricPrecision"
        >
          {d.attributes.years}
        </text>
      )}
    </g>
  );
}

export default function FamilyTreeView({ treeData }: Props) {
  const router = useRouter();
  const [translate, setTranslate] = useState({ x: 0, y: 60 });
  const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(null);

  const onContainerRef = useCallback(
    (el: HTMLDivElement | null) => {
      if (el && !containerRef) {
        setTranslate({ x: el.clientWidth / 2, y: 60 });
      }
      setContainerRef(el);
    },
    [containerRef]
  );

  const handlePersonClick = useCallback(
    (id: string) => {
      router.push(`/person/${id}`);
    },
    [router]
  );

  const renderNode = useCallback(
    (props: CustomNodeElementProps) => (
      <PersonNode {...props} onPersonClick={handlePersonClick} />
    ),
    [handlePersonClick]
  );

  return (
    <div ref={onContainerRef} className="w-full h-full bg-gray-50">
      <Tree
        data={treeData as unknown as RawNodeDatum}
        orientation="vertical"
        translate={translate}
        separation={{ siblings: 1.2, nonSiblings: 1.6 }}
        nodeSize={{ x: 168, y: 120 }}
        renderCustomNodeElement={renderNode}
        pathFunc="step"
        zoom={1}
        scaleExtent={{ min: 0.15, max: 2 }}
        enableLegacyTransitions={false}
        pathClassFunc={() => 'stroke-gray-300 fill-none stroke-[1.5]'}
      />
    </div>
  );
}

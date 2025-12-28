import React, { useCallback, useEffect, useState } from 'react';
import { ReactFlow, useNodesState, useEdgesState, Background, Controls } from '@xyflow/react';
import dagre from 'dagre';
import CustomNode from './CustomNode';
import '@xyflow/react/dist/style.css';

const initialHomeSections = ['Hero', 'Features', 'Testimonials', 'CTA', 'Footer'];

const getInitialStructure = () => ({
  pages: {
    id: 'home',
    label: 'Home',
    level: 1,
    children: [
      { id: 'about', label: 'About', level: 2, children: [] },
      {
        id: 'services',
        label: 'Services',
        level: 2,
        children: [
          { id: 'service1', label: 'Service Detail 1', level: 3, children: [] },
          { id: 'service2', label: 'Service Detail 2', level: 3, children: [] },
        ],
      },
      {
        id: 'blog',
        label: 'Blog',
        level: 2,
        children: [
          { id: 'blog1', label: 'Blog Post 1', level: 3, children: [] },
          { id: 'blog2', label: 'Blog Post 2', level: 3, children: [] },
          { id: 'author', label: 'Author Page', level: 3, children: [] },
        ],
      },
      {
        id: 'contact',
        label: 'Contact',
        level: 2,
        children: [
          { id: 'location', label: 'Location Info', level: 3, children: [] },
          { id: 'support', label: 'Support Page', level: 3, children: [] },
        ],
      },
    ],
  },
  homeSections: initialHomeSections,
});

const nodeTypes = { custom: CustomNode };

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 200;
const nodeHeight = 150;

const getLayoutedElements = (nodes, edges, direction = 'TB') => {
  const isHorizontal = direction === 'LR';
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.targetPosition = isHorizontal ? 'left' : 'top';
    node.sourcePosition = isHorizontal ? 'right' : 'bottom';
    node.position = {
      x: nodeWithPosition.x - nodeWidth / 2,
      y: nodeWithPosition.y - nodeHeight / 2,
    };
    return node;
  });

  return { nodes, edges };
};

function HierarchyFlow({ onSave, onExport, externalStructure }) {
  const [structure, setStructure] = useState(getInitialStructure());
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [homeSections, setHomeSections] = useState(initialHomeSections);

  const buildNodesAndEdges = useCallback((pageStructure, sections) => {
    const nodes = [];
    const edges = [];

    const addNode = (page, parentId = null) => {
      const isHome = page.id === 'home';
      nodes.push({
        id: page.id,
        type: 'custom',
        data: {
          label: page.label,
          level: page.level,
          sections: isHome ? sections : null,
          onSectionsChange: isHome ? setHomeSections : null,
        },
        className: `level-${page.level}`,
        position: { x: 0, y: 0 },
      });
      if (parentId) {
        edges.push({
          id: `${parentId}-${page.id}`,
          source: parentId,
          target: page.id,
          type: 'smoothstep',
        });
      }
      page.children.forEach((child) => addNode(child, page.id));
    };

    addNode(pageStructure.pages);
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(nodes, edges);
    return { nodes: layoutedNodes, edges: layoutedEdges };
  }, []);

  useEffect(() => {
    if (externalStructure) {
      setStructure(externalStructure);
      setHomeSections(externalStructure.homeSections);
    }
  }, [externalStructure]);

  useEffect(() => {
    const { nodes: newNodes, edges: newEdges } = buildNodesAndEdges(structure, homeSections);
    setNodes(newNodes);
    setEdges(newEdges);
  }, [structure, homeSections, setNodes, setEdges, buildNodesAndEdges]);

  const handleSave = () => {
    onSave({ ...structure, homeSections });
  };

  const handleExport = () => {
    onExport({ ...structure, homeSections });
  };

  return (
    <div className="h-[600px] border border-gray-300 rounded">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>
      <div className="mt-4 flex space-x-4">
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Save to LocalStorage
        </button>
        <button
          onClick={handleExport}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
        >
          Export JSON
        </button>
      </div>
    </div>
  );
}

export default HierarchyFlow;
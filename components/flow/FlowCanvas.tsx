"use client";

import { useCallback, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  Connection,
  Edge,
  NodeTypes,
  Panel,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Button } from "@/components/ui/button";
import { Plus, Play, Save, Sparkles } from "lucide-react";
import SourceNode from "./SourceNode";
import TransformNode from "./TransformNode";
import DestinationNode from "./DestinationNode";

const nodeTypes: NodeTypes = {
  source: SourceNode,
  transform: TransformNode,
  destination: DestinationNode,
};

const initialNodes = [
  {
    id: "1",
    type: "source",
    position: { x: 100, y: 100 },
    data: {
      label: "Webhook Receiver",
      webhookUrl: "https://api.eventmesh.dev/webhook/abc123",
    },
  },
  {
    id: "2",
    type: "transform",
    position: { x: 400, y: 100 },
    data: { label: "Extract Data", type: "javascript" as const },
  },
  {
    id: "3",
    type: "destination",
    position: { x: 700, y: 100 },
    data: { label: "Slack #engineering", type: "slack" as const },
  },
];

const initialEdges = [
  { id: "e1-2", source: "1", target: "2", animated: true },
  { id: "e2-3", source: "2", target: "3", animated: true },
];

export default function FlowCanvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const onConnect = useCallback(
    (params: Connection) =>
      setEdges((eds) => addEdge({ ...params, animated: true }, eds)),
    [setEdges]
  );

  const addSourceNode = () => {
    const newNode = {
      id: `source-${Date.now()}`,
      type: "source",
      position: { x: Math.random() * 300, y: Math.random() * 300 },
      data: { label: "New Webhook", webhookUrl: "" },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const addTransformNode = () => {
    const newNode = {
      id: `transform-${Date.now()}`,
      type: "transform",
      position: { x: Math.random() * 300 + 300, y: Math.random() * 300 },
      data: { label: "New Transform", type: "javascript" as const },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const addDestinationNode = () => {
    const newNode: any = {
      id: `destination-${Date.now()}`,
      type: "destination",
      position: { x: Math.random() * 300 + 600, y: Math.random() * 300 },
      data: { label: "New Destination", type: "webhook" as const },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  return (
    <div className="h-[calc(100vh-12rem)] w-full rounded-lg border bg-muted/30">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        className="bg-background"
      >
        <Background />
        <Controls />
        <MiniMap
          nodeColor={(node) => {
            if (node.type === "source") return "hsl(var(--primary))";
            if (node.type === "transform") return "hsl(var(--accent))";
            return "hsl(var(--secondary))";
          }}
          className="!bg-background !border-border"
        />

        <Panel position="top-left" className="flex gap-2">
          <Button
            onClick={addSourceNode}
            size="sm"
            variant="outline"
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Source
          </Button>
          <Button
            onClick={addTransformNode}
            size="sm"
            variant="outline"
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Transform
          </Button>
          <Button
            onClick={addDestinationNode}
            size="sm"
            variant="outline"
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Destination
          </Button>
        </Panel>

        <Panel position="top-right" className="flex gap-2">
          <Button size="sm" variant="outline" className="gap-2">
            <Sparkles className="h-4 w-4" />
            AI Generate
          </Button>
          <Button size="sm" variant="outline" className="gap-2">
            <Save className="h-4 w-4" />
            Save Flow
          </Button>
          <Button size="sm" className="gap-2">
            <Play className="h-4 w-4" />
            Activate
          </Button>
        </Panel>
      </ReactFlow>
    </div>
  );
}

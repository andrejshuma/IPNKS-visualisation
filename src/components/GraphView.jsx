// src/GraphView.jsx
import React, { useEffect, useRef } from "react";
import Graph from "graphology";
import { circular } from "graphology-layout";
import Sigma from "sigma";

const GraphView = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    // 1. Create a graph
    const graph = new Graph();
    graph.addNode("mentor1", {
      label: "Prof. A",
      x: 0,
      y: 0,
      size: 10,
      color: "#007bff",
    });
    graph.addNode("judge1", {
      label: "Prof. B",
      x: 1,
      y: 1,
      size: 10,
      color: "#28a745",
    });
    graph.addEdge("mentor1", "judge1", {
      label: "Was on same commission",
      size: 2,
    });

    // 2. Apply layout
    circular.assign(graph);

    // 3. Render with Sigma
    const renderer = new Sigma(graph, containerRef.current);

    return () => {
      renderer.kill();
    };
  }, []);

  return <div ref={containerRef} style={{ height: "500px" }} />;
};

export default GraphView;

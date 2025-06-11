// src/GraphView.jsx
import React, { useEffect, useRef } from "react";
import Graph from "graphology";
import { circular } from "graphology-layout";
import Sigma from "sigma";

const GraphView = ({ onNodeClick }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    // Wait for the container to have dimensions
    const checkContainer = () => {
      if (
        containerRef.current &&
        containerRef.current.offsetWidth > 0 &&
        containerRef.current.offsetHeight > 0
      ) {
        initializeGraph();
      } else {
        setTimeout(checkContainer, 100);
      }
    };

    const initializeGraph = () => {
      try {
        // 1. Create a graph
        const graph = new Graph();

        // Add nodes - remove the 'type' property that causes issues with Sigma
        graph.addNode("mentor1", {
          label: "Prof. A",
          x: 0,
          y: 0,
          size: 15,
          color: "#007bff",
          // Store type in a different property
          nodeType: "Mentor",
          institution: "University of Belgrade",
          department: "Computer Science",
          role: "Professor",
          degree: 1,
        });

        graph.addNode("judge1", {
          label: "Prof. B",
          x: 1,
          y: 1,
          size: 15,
          color: "#28a745",
          nodeType: "Judge",
          institution: "Faculty of Mathematics",
          department: "Applied Mathematics",
          role: "Associate Professor",
          degree: 1,
        });

        graph.addEdge("mentor1", "judge1", {
          label: "Was on same commission",
          size: 2,
        });

        // 2. Apply layout
        circular.assign(graph);

        // 3. Render with Sigma with proper settings
        const renderer = new Sigma(graph, containerRef.current, {
          allowInvalidContainer: true,
          renderLabels: true,
          renderEdgeLabels: false,
        });

        // 4. Handle node clicks
        renderer.on("clickNode", (event) => {
          const nodeId = event.node;
          const nodeData = graph.getNodeAttributes(nodeId);

          // Create enhanced node data for the sidebar
          const enhancedNodeData = {
            id: nodeId,
            ...nodeData,
            type: nodeData.nodeType, // Map back to 'type' for display
            connections: graph.neighbors(nodeId).map((neighborId) => ({
              name: graph.getNodeAttribute(neighborId, "label"),
              type: graph.getNodeAttribute(neighborId, "nodeType"),
            })),
          };

          if (onNodeClick) {
            onNodeClick(enhancedNodeData);
          }
        });

        return () => {
          renderer.kill();
        };
      } catch (error) {
        console.error("Error in GraphView:", error);
      }
    };

    checkContainer();
  }, [onNodeClick]);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "100%",
      }}
    />
  );
};

export default GraphView;

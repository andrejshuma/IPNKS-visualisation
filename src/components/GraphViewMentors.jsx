import React, { useEffect, useRef } from "react";
import Sigma from "sigma";
import Graph from "graphology";
import { circular } from "graphology-layout";
import jsonData from "../assets/demoData.json";
import colors from "../assets/colors.json";
import { useGlobalContext } from "../GlobalProvider.jsx";

export default function GraphViewMentors() {
    const graphRef = useRef(null);
    const rendererRef = useRef(null);
    const containerRef = useRef(null);

    const { selectedNode, setSelectedNode } = useGlobalContext();
    const { selectedGraphLayout } = useGlobalContext();
    const { nodeAddSize, edgeAddSize } = useGlobalContext();

    // Keep track of last offsets applied
    const lastNodeAddSize = useRef(0);
    const lastEdgeAddSize = useRef(0);

    // Initialize graph and renderer once
    useEffect(() => {
        const graph = new Graph();

        const edgeCount = {};
        const nodeInteractionCount = {};

        jsonData.forEach((data) => {
            const mentor = data.mentor;
            const nodes = [data.member1, data.member2];

            nodes.forEach((member) => {
                const key = [mentor, member].sort().join("-");

                edgeCount[key] = (edgeCount[key] || 0) + 1;

                nodeInteractionCount[mentor] = (nodeInteractionCount[mentor] || 0) + 1;
                nodeInteractionCount[member] = (nodeInteractionCount[member] || 0) + 1;
            });
        });

        Object.keys(nodeInteractionCount).forEach((person, index) => {
            const color = colors[index % colors.length];
            const baseSize = nodeInteractionCount[person] + 10;
            graph.addNode(person, {
                label: person,
                size: baseSize, // base size for rendering initially
                baseSize,      // store base size
                color: color,
            });
        });

        Object.entries(edgeCount).forEach(([key, count]) => {
            const [node1, node2] = key.split("-");
            if (!graph.hasEdge(node1, node2) && !graph.hasEdge(node2, node1)) {
                const baseSize = Math.max(1, count);
                graph.addUndirectedEdgeWithKey(key, node1, node2, {
                    size: baseSize,
                    baseSize,
                    label: `${count} interactions`,
                });
            }
        });

        if (selectedGraphLayout === "circular") {
            circular.assign(graph);
        } else if (selectedGraphLayout === "random") {
            graph.forEachNode((node) => {
                graph.setNodeAttribute(node, "x", Math.random() * 1000);
                graph.setNodeAttribute(node, "y", Math.random() * 1000);
            });
        }

        graphRef.current = graph;

        rendererRef.current = new Sigma(graph, containerRef.current);

        rendererRef.current.on("clickNode", (event) => {
            const nodeId = event.node;
            setSelectedNode(nodeId);
        });

        return () => {
            rendererRef.current?.kill();
            graphRef.current = null;
            rendererRef.current = null;
        };
    }, []); // run only once

    // Update sizes on nodeAddSize or edgeAddSize changes
    useEffect(() => {
        if (!graphRef.current) return;

        const graph = graphRef.current;

        // To update sizes properly, just recompute:
        // size = baseSize + currentOffset

        graph.forEachNode((node, attrs) => {
            const baseSize = attrs.baseSize ?? attrs.size ?? 1;
            graph.setNodeAttribute(node, "size", baseSize + nodeAddSize);
        });

        graph.forEachEdge((edge, attrs) => {
            const baseSize = attrs.baseSize ?? attrs.size ?? 1;
            graph.setEdgeAttribute(edge, "size", baseSize + edgeAddSize);
        });

        rendererRef.current.refresh();

        // Update last offsets (optional if you want to keep track)
        lastNodeAddSize.current = nodeAddSize;
        lastEdgeAddSize.current = edgeAddSize;
    }, [nodeAddSize, edgeAddSize]);

    // Change layout only when selectedGraphLayout changes
    useEffect(() => {
        if (!graphRef.current) return;

        const graph = graphRef.current;

        if (selectedGraphLayout === "circular") {
            circular.assign(graph);
        } else if (selectedGraphLayout === "random") {
            graph.forEachNode((node) => {
                graph.setNodeAttribute(node, "x", Math.random() * 1000);
                graph.setNodeAttribute(node, "y", Math.random() * 1000);
            });
        }

        rendererRef.current.refresh();
    }, [selectedGraphLayout]);

    return <div ref={containerRef} style={{ width: "100%", height: "100%", border: "none" }} />;
}

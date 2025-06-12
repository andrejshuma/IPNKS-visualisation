import React, { useEffect, useRef } from "react";
import Sigma from "sigma";
import Graph from "graphology";
import { circular } from "graphology-layout";
import jsonData from "../assets/diplomas.json";
import colors from "../assets/colors.json";
import { useGlobalContext } from "../GlobalProvider.jsx";

export default function GraphViewMentors() {
    const graphRef = useRef(null);
    const rendererRef = useRef(null);
    const containerRef = useRef(null);
    const hoveredNode = useRef(null);

    const { selectedNode, setSelectedNode, selectedGraphLayout, nodeAddSize, edgeAddSize } = useGlobalContext();

    useEffect(() => {
        const graph = new Graph();
        const edgeCount = {};
        const nodeMentorCount = {};

        jsonData.forEach(({ mentor, member1, member2 }) => {
            mentor = mentor.split("-")[0].trim();
            const nodes = [member1.split("-")[0].trim(), member2.split("-")[0].trim()];

            nodes.forEach((member) => {
                const key = [mentor, member].sort().join("-");
                edgeCount[key] = (edgeCount[key] || 0) + 1;
                nodeMentorCount[mentor] = (nodeMentorCount[mentor] || 0) + 1;
            });
        });

        Object.keys(nodeMentorCount).forEach((mentor, i) => {
            const baseSize = Math.log(nodeMentorCount[mentor]) + 10;
            graph.addNode(mentor, {
                label: mentor,
                baseSize,
                size: baseSize,
                color: colors[i % colors.length],
            });
        });

        Object.entries(edgeCount).forEach(([key, count]) => {
            const [node1, node2] = key.split("-");
            const size = Math.log(count) + 1;

            [node1, node2].forEach(node => {
                if (!graph.hasNode(node)) {
                    graph.addNode(node, {
                        label: node,
                        baseSize: 10,
                        size: 10,
                        color: "#FF0000",
                    });
                }
            });

            if (!graph.hasEdge(node1, node2)) {
                graph.addUndirectedEdgeWithKey(key, node1, node2, {
                    label: `${count} interactions`,
                    baseSize: size,
                    size,
                    hidden: true,
                });
            }
        });

        applyLayout(graph, selectedGraphLayout);

        graphRef.current = graph;
        rendererRef.current = new Sigma(graph, containerRef.current, {
            labelRenderedSizeThreshold: Infinity, // Enable all labels regardless of zoom
            nodeReducer: (node, data) => {
                if (!hoveredNode.current) {
                    return {
                        ...data,
                        label: "", // Hide all labels by default
                    };
                }

                const neighbors = new Set(graph.neighbors(hoveredNode.current));
                return {
                    ...data,
                    label: data.label, // Show all labels on hover
                    color:
                        node === hoveredNode.current || neighbors.has(node)
                            ? data.color
                            : "#CCC", // Dim unrelated nodes
                    zIndex: node === hoveredNode.current ? 2 : 1,
                };
            },
            edgeReducer: (edge, data) => {
                if (!hoveredNode.current) return { ...data, hidden: true }; // Hide all edges by default

                const [source, target] = graph.extremities(edge);
                const isConnected =
                    source === hoveredNode.current || target === hoveredNode.current;

                return {
                    ...data,
                    hidden: !isConnected,
                };
            },

        });


        rendererRef.current.on("clickNode", ({ node }) => {
            setSelectedNode(node);
        });

        rendererRef.current.on("enterNode", ({ node }) => {
            hoveredNode.current = node;
            rendererRef.current.refresh();
        });

        rendererRef.current.on("leaveNode", () => {
            hoveredNode.current = null;
            rendererRef.current.refresh();
        });

        return () => {
            rendererRef.current.kill();
            rendererRef.current = null;
            graphRef.current = null;
        };
    }, []);

    // LAYOUT EFFECT
    useEffect(() => {
        if (!graphRef.current) return;
        applyLayout(graphRef.current, selectedGraphLayout);
        rendererRef.current.refresh();
    }, [selectedGraphLayout]);

    // NODE AND EDGE SIZE EFFECT
    useEffect(() => {
        if (!graphRef.current) return;
        const graph = graphRef.current;

        graph.forEachNode((node, attrs) => {
            const newSize = (attrs.baseSize ?? 1) + nodeAddSize;
            graph.setNodeAttribute(node, "size", newSize);
        });

        graph.forEachEdge((edge, attrs) => {
            const newSize = (attrs.baseSize ?? 1) + edgeAddSize;
            graph.setEdgeAttribute(edge, "size", newSize);
        });

        rendererRef.current.refresh();
    }, [nodeAddSize, edgeAddSize]);

    return <div ref={containerRef} style={{ width: "100%", height: "100%" }} />;
}

function applyLayout(graph, layoutType) {
    if (layoutType === "circular") {
        circular.assign(graph);
    } else if (layoutType === "random") {
        const positions = [];
        graph.forEachNode((node) => {
            let x, y, tries = 0;
            do {
                x = Math.random() * 1000;
                y = Math.random() * 1000;
                tries++;
            } while (
                positions.some(pos => {
                    const dx = pos.x - x;
                    const dy = pos.y - y;
                    return Math.sqrt(dx * dx + dy * dy) < 100;
                }) && tries < 100
                );
            positions.push({ x, y });
            graph.setNodeAttribute(node, "x", x);
            graph.setNodeAttribute(node, "y", y);
        });
    }
}

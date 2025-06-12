import React, { useEffect, useRef } from "react";
import Sigma from "sigma";
import Graph from "graphology";
import { circular } from "graphology-layout";
import jsonData from "../assets/diplomas.json";
import colors from "../assets/colors.json";
import { useGlobalContext } from "../GlobalProvider.jsx";
import forceAtlas2 from 'graphology-layout-forceatlas2';

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
            const baseSize = Math.log(nodeMentorCount[mentor]) + 5;
            graph.addNode(mentor, {
                label: mentor,
                baseSize,
                size: baseSize,
                color: colors[i % colors.length],
            });
        });

        Object.entries(edgeCount).forEach(([key, count]) => {
            const [node1, node2] = key.split("-");
            const size = Math.log(count);

            [node1, node2].forEach(node => {
                if (!graph.hasNode(node)) {
                    graph.addNode(node, {
                        label: node,
                        isCommissionOnly: true,
                        baseSize: 5,
                        size: 5,
                        color: "#3CB3AA",
                    });
                }
            });

            if (!graph.hasEdge(node1, node2)) {
                graph.addUndirectedEdgeWithKey(key, node1, node2, {
                    label: `${count} interactions`,
                    baseSize: size,
                    size,
                    hidden: true,
                    color: "#ccc"
                });
            }
        });

        const {maxDegree, degrees} = findMaxDegreeNode(graph)

        graph.forEachNode((node) => {
            const degree = degrees[node];
            const intensity = degree / maxDegree;
            const color = interpolateColor("#2993D1", "#2C3E50", intensity);
            const isCommissionOnly = graph.getNodeAttribute(node, "isCommissionOnly");
            if (!isCommissionOnly) {
                graph.setNodeAttribute(node, "color", color);
            }
        });

        applyLayout(graph, selectedGraphLayout);

        graphRef.current = graph;
        rendererRef.current = new Sigma(graph, containerRef.current, {
            labelRenderedSizeThreshold: 0,
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
                    label: node === hoveredNode.current || neighbors.has(node) ? data.label : "",
                    color:
                        node === hoveredNode.current || neighbors.has(node)
                            ? data.color
                            : "#eee", // Dim unrelated nodes
                    zIndex: node === hoveredNode.current ? 2 : 1,
                };
            },
            edgeReducer: (edge, data) => {
                if (!hoveredNode.current) return { ...data, hidden: true };

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

function findMaxDegreeNode(graph) {
    const degrees = {};
    let maxDegree = 0;

    graph.forEachNode((node) => {
        const degree = graph.degree(node);
        degrees[node] = degree;
        if (degree > maxDegree) maxDegree = degree;
    });

    return {maxDegree, degrees};

}

function interpolateColor(lightHex, darkHex, t) {
    const hexToRgb = (hex) => hex.match(/\w\w/g).map(x => parseInt(x, 16));
    const rgbToHex = (r, g, b) =>
        "#" + [r, g, b].map(x => x.toString(16).padStart(2, "0")).join("");

    const [r1, g1, b1] = hexToRgb(lightHex);
    const [r2, g2, b2] = hexToRgb(darkHex);

    const r = Math.round(r1 + (r2 - r1) * t);
    const g = Math.round(g1 + (g2 - g1) * t);
    const b = Math.round(b1 + (b2 - b1) * t);

    return rgbToHex(r, g, b);
}

function applyLayout(graph, layoutType) {
    circular.assign(graph);

    const radiusX = 2000; // wider horizontally
    const radiusY = 1000;  // shorter vertically

    graph.forEachNode((node, attrs) => {
        graph.setNodeAttribute(node, "x", attrs.x * radiusX);
        graph.setNodeAttribute(node, "y", attrs.y * radiusY);
    });

    if (layoutType === "random") {
        // Initialize positions randomly in [0,1]
        graph.forEachNode((node) => {
            graph.setNodeAttribute(node, "x", Math.random());
            graph.setNodeAttribute(node, "y", Math.random());
        });

        // Run ForceAtlas2
        forceAtlas2.assign(graph, {
            iterations: 200,
            settings: {
                gravity: 0.1,
                scalingRatio: 50,
                outboundAttractionDistribution: true,
                barnesHutOptimize: true,
            },
        });

        // Stretch the layout to a rectangle after ForceAtlas2 finishes
        const widthFactor = 5;  // Stretch horizontally by 3x
        const heightFactor = 2; // Keep height as is (or compress by <1)

        graph.forEachNode((node, attrs) => {
            const newX = attrs.x * widthFactor;
            const newY = attrs.y * heightFactor;
            graph.setNodeAttribute(node, "x", newX);
            graph.setNodeAttribute(node, "y", newY);
        });
    }
}


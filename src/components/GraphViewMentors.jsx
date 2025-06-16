import React, {useEffect, useRef} from "react";
import Sigma from "sigma";
import Graph from "graphology";
import {circular} from "graphology-layout";
import jsonData from "../assets/diplomas.json";
import colors from "../assets/colors.json";
import {useGlobalContext} from "../GlobalProvider.jsx";
import forceAtlas2 from "graphology-layout-forceatlas2";

export default function GraphViewMentors() {
    const graphRef = useRef(null);
    const rendererRef = useRef(null);
    const containerRef = useRef(null);
    const hoveredNode = useRef(null);
    const clickedNode = useRef(null);
    const activeFilterRef = useRef({min: null, max: null});

    const {
        selectedNode,
        setSelectedNode,
        selectedNodeDetails,
        setSelectedNodeDetails,
        searchedMentor,
        setSearchedMentor,
        selectedGraphLayout,
        nodeAddSize,
        edgeAddSize,
        activeNodeFilter,
    } = useGlobalContext();

    // Calculate details for a specific node
    const calculateNodeDetails = (nodeName) => {
        const mentorCollaborations = [];
        const memberCollaborations = [];
        let mentorCount = 0;
        let totalCollaborations = 0;

        const getEdgeWeight = (node1, node2) => {
            if (!graphRef.current) return 0;
            const key = [node1, node2].sort().join("-");
            if (graphRef.current.hasEdge(node1, node2)) {
                const edgeAttrs = graphRef.current.getEdgeAttributes(node1, node2);
                // Extract count from label like "5 interactions"
                const match = edgeAttrs.label?.match(/(\d+) interactions/);
                return match ? parseInt(match[1], 10) : 0;
            }
            return 0;
        };

        jsonData.forEach(({mentor, member1, member2}) => {
            const cleanMentor = mentor.split("-")[0].trim();
            const cleanMember1 = member1.split("-")[0].trim();
            const cleanMember2 = member2.split("-")[0].trim();

            const isInFilterRange = (weight) => {
                if (activeFilterRef.current.min !== null && weight < activeFilterRef.current.min) return false;
                if (activeFilterRef.current.max !== null && weight > activeFilterRef.current.max) return false;
                return true;
            };

            if (cleanMentor === nodeName) {
                // This person was a mentor
                mentorCount++;

                // Add commission members with weights
                if (!mentorCollaborations.find((m) => m.name === cleanMember1)) {
                    const weight = getEdgeWeight(nodeName, cleanMember1);
                    if (isInFilterRange(weight))
                        mentorCollaborations.push({name: cleanMember1, weight});
                }
                if (!mentorCollaborations.find((m) => m.name === cleanMember2)) {
                    const weight = getEdgeWeight(nodeName, cleanMember2);
                    if (isInFilterRange(weight))
                        mentorCollaborations.push({name: cleanMember2, weight});
                }
            }

            if (cleanMember1 === nodeName || cleanMember2 === nodeName) {
                // This person was a commission member
                if (!memberCollaborations.find((m) => m.name === cleanMentor)) {
                    const weight = getEdgeWeight(nodeName, cleanMentor);
                    if (isInFilterRange(weight))
                        memberCollaborations.push({name: cleanMentor, weight});
                }
            }
        });

        if (graphRef.current && graphRef.current.hasNode(nodeName)) {
            totalCollaborations = graphRef.current.degree(nodeName);
        }

        return {
            name: nodeName,
            mentorCount,
            totalCollaborations,
            mentorCollaborations: mentorCollaborations.sort((a, b) =>
                b.weight - a.weight
            ),
            memberCollaborations: memberCollaborations.sort((a, b) =>
                b.weight - a.weight
            ),
        };
    };

    // Function to calculate total weight of all edges for a node
    const calculateNodeTotalWeight = (graph, nodeName) => {
        let totalWeight = 0;
        if (!graph.hasNode(nodeName)) return totalWeight;

        graph.forEachEdge(nodeName, (edge, attributes) => {
            // Extract weight from label like "5 interactions"
            const match = attributes.label?.match(/(\d+) interactions/);
            if (match) {
                totalWeight += parseInt(match[1], 10);
            }
        });

        return totalWeight;
    };

    // INITIALIZE GRAPH AND RENDERER
    useEffect(() => {
        const graph = new Graph();
        const edgeCount = {};
        const nodeMentorCount = {};

        jsonData.forEach(({mentor, member1, member2}) => {
            mentor = mentor.split("-")[0].trim();
            const nodes = [
                member1.split("-")[0].trim(),
                member2.split("-")[0].trim(),
            ];

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

            [node1, node2].forEach((node) => {
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
                    color: "#ccc",
                });
            }
        });

        const {maxDegree, degrees} = findMaxDegreeNode(graph);

        // Set node colors based on degree
        graph.forEachNode((node) => {
            const degree = degrees[node];
            const intensity = degree / maxDegree;
            const color = interpolateColor("#2993D1", "#2C3E50", intensity);
            const isCommissionOnly = graph.getNodeAttribute(node, "isCommissionOnly");
            if (!isCommissionOnly) {
                graph.setNodeAttribute(node, "color", color);
            }
        });

        // Apply initial layout
        applyLayout(graph, selectedGraphLayout);

        graphRef.current = graph;
        rendererRef.current = new Sigma(graph, containerRef.current, {
            labelRenderedSizeThreshold: 0,
            nodeReducer: (node, data) => {
                const focusedNode = clickedNode.current || hoveredNode.current;

                // Filter to show nodes within a range of collaborations
                if (
                    activeFilterRef.current.min !== null ||
                    activeFilterRef.current.max !== null
                ) {
                    const nodeWeight = calculateNodeTotalWeight(graph, node);
                    let nodeVisible = true;

                    if (
                        activeFilterRef.current.min !== null &&
                        nodeWeight < activeFilterRef.current.min
                    ) {
                        nodeVisible = false;
                    }
                    if (
                        activeFilterRef.current.max !== null &&
                        nodeWeight > activeFilterRef.current.max
                    ) {
                        nodeVisible = false;
                    }

                    if (!nodeVisible) {
                        return {
                            ...data,
                            hidden: true,
                            label: "",
                        };
                    }

                    return {
                        ...data,
                        hidden: false,
                        label: data.label,
                    };
                }

                // Default behavior when no filter is active
                if (!focusedNode) {
                    return {
                        ...data,
                        label: "", // Hide all labels by default
                    };
                }

                const neighbors = new Set(graph.neighbors(focusedNode));

                return {
                    ...data,
                    // label: node === focusedNode || neighbors.has(node) ? data.label : "",
                    color:
                        node === focusedNode || neighbors.has(node) ? data.color : "#eee", // Dim unrelated nodes
                    zIndex: node === focusedNode ? 2 : 1,
                };
            },
            edgeReducer: (edge, data) => {
                const focusedNode = clickedNode.current || hoveredNode.current;

                // Filter to show edges between nodes within a range of collaborations
                if (
                    activeFilterRef.current.min !== null ||
                    activeFilterRef.current.max !== null
                ) {
                    const [source, target] = graph.extremities(edge);
                    const sourceWeight = calculateNodeTotalWeight(graph, source);
                    const targetWeight = calculateNodeTotalWeight(graph, target);

                    const sourceVisible =
                        (activeFilterRef.current.min === null || sourceWeight >= activeFilterRef.current.min) &&
                        (activeFilterRef.current.max === null || sourceWeight <= activeFilterRef.current.max);

                    const targetVisible =
                        (activeFilterRef.current.min === null || targetWeight >= activeFilterRef.current.min) &&
                        (activeFilterRef.current.max === null || targetWeight <= activeFilterRef.current.max);

                    const filterAllowsEdge = sourceVisible && targetVisible;

                    const focusedNode = clickedNode.current || hoveredNode.current;
                    if (!focusedNode || !filterAllowsEdge) return { ...data, hidden: true };

                    const isConnected = source === focusedNode || target === focusedNode;
                    return {
                        ...data,
                        hidden: !isConnected,
                    };
                }

                // Default behavior when no filter is active
                if (!focusedNode) return {...data, hidden: true};

                const [source, target] = graph.extremities(edge);
                const isConnected = source === focusedNode || target === focusedNode;

                return {
                    ...data,
                    hidden: !isConnected,
                };
            },
        });

        // Function to drag nodes
        enableNodeDragging(rendererRef.current, graph);

        // Calculate and set detailed information
        rendererRef.current.on("clickNode", ({node}) => {
            clickedNode.current = node;
            setSelectedNode(node);

            const nodeDetails = calculateNodeDetails(node);
            setSelectedNodeDetails(nodeDetails);

            rendererRef.current.refresh();
        });

        // Clear clicked node when clicking on empty space
        rendererRef.current.on("clickStage", () => {
            clickedNode.current = null;
            setSelectedNode(null);
            setSelectedNodeDetails(null);
            rendererRef.current.refresh();
        });

        // Show node with neighbors in hover
        rendererRef.current.on("enterNode", ({node}) => {
            hoveredNode.current = node;
            rendererRef.current.refresh();
        });

        // Clear node with neighbors in hover
        rendererRef.current.on("leaveNode", () => {
            hoveredNode.current = null;
            rendererRef.current.refresh();
        });

        return () => {
            hoveredNode.current = null;
            clickedNode.current = null;
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

    // FILTER EFFECT - Handle node interaction filter changes
    useEffect(() => {
        console.log("Filter changed:", activeNodeFilter);
        activeFilterRef.current = activeNodeFilter;

        clickedNode.current = null;
        setSelectedNodeDetails(null);
        setSelectedNode(null);

        if (!rendererRef.current || !graphRef.current) return;

        const graph = graphRef.current;

        // Trigger a complete re-render by updating a dummy attribute and then refreshing
        graph.forEachNode((node) => {
            const currentValue = graph.getNodeAttribute(node, "filterUpdate") || 0;
            graph.setNodeAttribute(node, "filterUpdate", currentValue + 1);
        });

        rendererRef.current.refresh();
    }, [activeNodeFilter]);

    // SEARCH EFFECT - Handle searched mentor
    useEffect(() => {
        if (!searchedMentor || !graphRef.current) return;

        const graph = graphRef.current;

        // Check if the searched mentor exists as a node in the graph
        if (graph.hasNode(searchedMentor)) {
            // Set the clicked node state to focus on this mentor
            clickedNode.current = searchedMentor;
            setSelectedNode(searchedMentor);

            // Calculate and set detailed information
            const nodeDetails = calculateNodeDetails(searchedMentor);
            setSelectedNodeDetails(nodeDetails);

            // Refresh the renderer to show the focus
            rendererRef.current.refresh();

            // Clear the search state to prevent re-triggering
            setSearchedMentor(null);
        }
    }, [searchedMentor]);

    return <div ref={containerRef} style={{width: "100%", height: "100%"}}/>;
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
    const hexToRgb = (hex) => hex.match(/\w\w/g).map((x) => parseInt(x, 16));
    const rgbToHex = (r, g, b) =>
        "#" + [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("");

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
    const radiusY = 1000; // shorter vertically

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
        const widthFactor = 5; // Stretch horizontally by 3x
        const heightFactor = 2; // Keep height as is (or compress by <1)

        graph.forEachNode((node, attrs) => {
            const newX = attrs.x * widthFactor;
            const newY = attrs.y * heightFactor;
            graph.setNodeAttribute(node, "x", newX);
            graph.setNodeAttribute(node, "y", newY);
        });
    }
}

export function enableNodeDragging(sigma, graph) {
    let draggedNode = null;
    let isDragging = false;

    const getGraphCoords = (event) => {
        const rect = sigma.getContainer().getBoundingClientRect();
        return sigma.viewportToGraph({
            x: event.clientX - rect.left,
            y: event.clientY - rect.top,
        });
    };

    sigma.on("downNode", (e) => {
        draggedNode = e.node;
        isDragging = true;
        sigma.getCamera().disable();
    });

    sigma.getContainer().addEventListener("pointermove", (e) => {
        if (!isDragging || !draggedNode) return;
        const coords = getGraphCoords(e);
        graph.setNodeAttribute(draggedNode, "x", coords.x);
        graph.setNodeAttribute(draggedNode, "y", coords.y);
    });

    sigma.getContainer().addEventListener("pointerup", () => {
        if (isDragging) {
            isDragging = false;
            draggedNode = null;
            sigma.getCamera().enable();
        }
    });

    sigma.getContainer().addEventListener("mouseleave", () => {
        if (isDragging) {
            isDragging = false;
            draggedNode = null;
            sigma.getCamera().enable();
        }
    });
}



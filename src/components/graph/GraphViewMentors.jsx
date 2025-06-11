import React, { useEffect, useRef } from "react";
import Sigma from "sigma";
import Graph from "graphology";
import { circular } from "graphology-layout";
import jsonData from "../../assets/demoData.json";
import colors from "../../assets/colors.json";

export default function GraphViewMentors() {
    const containerRef = useRef(null);
    const nodeSize = 12;

    useEffect(() => {
        const graph = new Graph();
        const edgeCount = {};
        const nodeInteractionCount = {};

        jsonData.forEach(data => {
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
            graph.addNode(person, {
                label: person,
                size: nodeInteractionCount[person] + 10,    // CHANGE IN PROD
                color: color,
            });
        });

        Object.entries(edgeCount).forEach(([key, count]) => {
            const [node1, node2] = key.split("-");
            if (!graph.hasEdge(node1, node2) && !graph.hasEdge(node2, node1)) {
                graph.addUndirectedEdgeWithKey(key, node1, node2, {
                    size: Math.max(1, count),
                    label: `${count} interactions`,
                });
            }
        });

        // Scatter layout
        graph.forEachNode((node) => {
            graph.setNodeAttribute(node, "x", Math.random() * 1000);
            graph.setNodeAttribute(node, "y", Math.random() * 1000);
        });

        const renderer = new Sigma(graph, containerRef.current);
        return () => {
            renderer.kill();
        };
    }, []);



    return (
        <div
            ref={containerRef}
            style={{ width: "800px", height: "600px", border: "1px solid #ccc" }}
        />
    );
}

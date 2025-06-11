import React, { useEffect, useRef } from "react";
import Sigma from "sigma";
import Graph from "graphology";
import { circular } from "graphology-layout";
import jsonData from "../../assets/demoData.json";
import colors from "../../assets/colors.json";

export default function GraphViewMentors() {
    const containerRef = useRef(null);

    useEffect(() => {
        const graph = new Graph();
        const edgeCount = {};

        jsonData.forEach((data, index) => {
            const mentor = data.mentor;
            const members = [data.member1, data.member2];
            let color = colors[index % colors.length];

            if (!graph.hasNode(mentor)) {
                graph.addNode(mentor, {
                    label: mentor,
                    size: 20,
                    color: color,
                });
            }

            members.forEach((member) => {
                if (!graph.hasNode(member)) {
                    graph.addNode(member, {
                        label: member,
                        size: 5,
                        color: "#222222",
                    });
                }

                const key = `${mentor}-${member}`;
                edgeCount[key] = (edgeCount[key] || 0) + 1;
            });
        });

        Object.entries(edgeCount).forEach(([key, count]) => {
            const [mentor, member] = key.split("-");

            graph.addEdge(mentor, member, {
                size: Math.max(1, count),
                label: `${count} connections`,
            });
        });

        // circular.assign(graph);
        graph.forEachNode((node, attributes) => {
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

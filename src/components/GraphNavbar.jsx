import React from "react";
import "./GraphNavbar.css";
import jsonData from "../assets/demoData.json"
import {useGlobalContext} from "../GlobalProvider.jsx";
import {node} from "globals";

const GraphNavbar = () => {
    const {selectedGraphLayout, setSelectedGraphLayout} = useGlobalContext();
    const {nodeAddSize, setNodeAddSize} = useGlobalContext();
    const {edgeAddSize, setEdgeAddSize} = useGlobalContext();

    const uniquePeople = new Set();
    const edgeCount = new Set();

    jsonData.forEach(data => {
        const { mentor, member1, member2 } = data;
        uniquePeople.add(mentor);
        uniquePeople.add(member1);
        uniquePeople.add(member2);

        const edges = [
            [mentor, member1],
            [mentor, member2]
        ];

        edges.forEach(([a, b]) => {
            const sortedKey = [a, b].sort().join("-");
            edgeCount.add(sortedKey);
        });
    });

    return (
    <div className="graph-navbar">
      <div className="navbar-section">
        <h4>Graph Settings</h4>
        <div className="control-group">
          <label>Node Size:</label>
          <input type="range" min="0" max="10" value={nodeAddSize} onChange={(e) => setNodeAddSize(Number(e.target.value))}/>
        </div>
        <div className="control-group">
          <label>Edge Thickness:</label>
          <input type="range" min="1" max="5" value={edgeAddSize} onChange={(e) => setEdgeAddSize(Number(e.target.value))}/>
        </div>
      </div>

      <div className="navbar-section">
        <h4>Layout</h4>
        <div className="control-group">
          <button className="control-btn" onClick={() => setSelectedGraphLayout("circular")}>Circular</button>
          <button className="control-btn" onClick={() => setSelectedGraphLayout("random")}>Random</button>
        </div>
      </div>

      <div className="navbar-section">
        <h4>Statistics</h4>
        <div className="stats-inline">
          <span className="stat-item">Nodes: {uniquePeople.size}</span>
          <span className="stat-item">Edges: {edgeCount.size}</span>
        </div>
      </div>
    </div>
  );
};

export default GraphNavbar;

import React from "react";
import "./GraphNavbar.css";
import jsonData from "../assets/demoData.json"

const GraphNavbar = () => {
  return (
    <div className="graph-navbar">
      <div className="navbar-section">
        <h4>Graph Settings</h4>
        <div className="control-group">
          <label>Node Size:</label>
          <input type="range" min="5" max="20" defaultValue="10" />
        </div>
        <div className="control-group">
          <label>Edge Thickness:</label>
          <input type="range" min="1" max="5" defaultValue="2" />
        </div>
      </div>

      <div className="navbar-section">
        <h4>Layout</h4>
        <div className="control-group">
          <button className="control-btn">Circular</button>
          <button className="control-btn">Force</button>
          <button className="control-btn">Random</button>
        </div>
      </div>

      <div className="navbar-section">
        <h4>Statistics</h4>
        <div className="stats-inline">
          <span className="stat-item">Nodes: {jsonData.length}</span>
          <span className="stat-item">Edges: {jsonData.length * (jsonData.length) / 2}</span>
        </div>
      </div>
    </div>
  );
};

export default GraphNavbar;

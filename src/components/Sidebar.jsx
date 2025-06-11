import React, { useState } from "react";
import "./Sidebar.css";

const Sidebar = ({ selectedNode = null }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <aside className={`sidebar ${isCollapsed ? "collapsed" : ""}`}>
      <div className="sidebar-header">
        <button className="toggle-btn" onClick={toggleSidebar}>
          {isCollapsed ? "→" : "←"}
        </button>
        {!isCollapsed && <h3>Node Details</h3>}
      </div>

      {!isCollapsed && (
        <div className="sidebar-content">
          {selectedNode ? (
            <>
              <div className="sidebar-section">
                <h4>Basic Information</h4>
                <div className="info-item">
                  <span className="info-label">Name:</span>
                  <span className="info-value">
                    {selectedNode.label || "Unknown"}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Type:</span>
                  <span className="info-value">
                    {selectedNode.type || "Unknown"}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">ID:</span>
                  <span className="info-value">{selectedNode.id || "N/A"}</span>
                </div>
              </div>

              <div className="sidebar-section">
                <h4>Graph Properties</h4>
                <div className="info-item">
                  <span className="info-label">Degree:</span>
                  <span className="info-value">{selectedNode.degree || 0}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Size:</span>
                  <span className="info-value">{selectedNode.size || 10}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Color:</span>
                  <span className="info-value">
                    <span
                      className="color-indicator"
                      style={{ backgroundColor: selectedNode.color || "#000" }}
                    ></span>
                    {selectedNode.color || "#000000"}
                  </span>
                </div>
              </div>

              <div className="sidebar-section">
                <h4>Academic Details</h4>
                <div className="info-item">
                  <span className="info-label">Institution:</span>
                  <span className="info-value">
                    {selectedNode.institution || "Not specified"}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Department:</span>
                  <span className="info-value">
                    {selectedNode.department || "Not specified"}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Role:</span>
                  <span className="info-value">
                    {selectedNode.role || "Not specified"}
                  </span>
                </div>
              </div>

              <div className="sidebar-section">
                <h4>Connections</h4>
                <div className="connections-list">
                  {selectedNode.connections &&
                  selectedNode.connections.length > 0 ? (
                    selectedNode.connections.map((connection, index) => (
                      <div key={index} className="connection-item">
                        <span className="connection-name">
                          {connection.name}
                        </span>
                        <span className="connection-type">
                          {connection.type}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="no-connections">No connections available</p>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="no-selection">
              <div className="placeholder-content">
                <h4>No Node Selected</h4>
                <p>
                  Click on a node in the graph to view its details and
                  properties.
                </p>
                <div className="placeholder-icon">📊</div>
              </div>
            </div>
          )}
        </div>
      )}
    </aside>
  );
};

export default Sidebar;

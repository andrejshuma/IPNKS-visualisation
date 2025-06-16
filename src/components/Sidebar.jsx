import React, { useState } from "react";
import "./Sidebar.css";
import { useGlobalContext } from "../GlobalProvider.jsx";

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { selectedNode, selectedNodeDetails, setSearchedMentor } =
    useGlobalContext();

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <aside className={`sidebar ${isCollapsed ? "collapsed" : ""}`}>
      <div className="sidebar-header">
        <button className="toggle-btn" onClick={toggleSidebar}>
          {isCollapsed ? "→" : "←"}
        </button>
        {!isCollapsed && (
          <h3 style={{textAlign: "right"}}>
            {selectedNodeDetails
              ? selectedNodeDetails.name
              : "Детали за ментор"}
          </h3>
        )}
      </div>

      {!isCollapsed && (
        <div className="sidebar-content">
          {selectedNodeDetails ? (
            <>
              <div className="sidebar-section">
                <h4>Информации за професор</h4>
                <div className="info-item">
                  <span className="info-label">Име:</span>
                  <span className="info-value">{selectedNodeDetails.name}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Соработувал со:</span>
                  <span className="info-value">
                    {selectedNodeDetails.totalCollaborations} колеги
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Менторства:</span>
                  <span className="info-value">
                    {selectedNodeDetails.mentorCount}
                  </span>
                </div>
              </div>

              <div className="sidebar-section">
                <h4>Членови во комисија (како ментор)</h4>
                <div className="dropdown-list">
                  {selectedNodeDetails.mentorCollaborations.length > 0 ? (
                    <select
                      className="collaboration-dropdown"
                      size="5"
                      onChange={(e) => setSearchedMentor(e.target.value)}
                    >
                      {selectedNodeDetails.mentorCollaborations
                          .sort((a, b) => b.weight - a.weight)
                          .map(
                        (member, index) => (
                          <option key={index} value={member.name || member}>
                            {typeof member === "object"
                              ? `${member.name} (${member.weight})`
                              : member}
                          </option>
                        )
                      )}
                    </select>
                  ) : (
                    <p className="no-data">Нема податоци за менторства</p>
                  )}
                </div>
              </div>

              <div className="sidebar-section">
                <h4>Ментори (како член)</h4>
                <div className="dropdown-list">
                  {selectedNodeDetails.memberCollaborations.length > 0 ? (
                    <select
                      className="collaboration-dropdown"
                      size="5"
                      onChange={(e) => setSearchedMentor(e.target.value)}
                    >
                      {selectedNodeDetails.memberCollaborations
                          .sort((a, b) => b.weight - a.weight)
                          .map(
                        (mentor, index) => (
                          <option key={index} value={mentor.name || mentor}>
                            {typeof mentor === "object"
                              ? `${mentor.name} (${mentor.weight})`
                              : mentor}
                          </option>
                        )
                      )}
                    </select>
                  ) : (
                    <p className="no-data">Нема податоци за членства</p>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="no-selection">
              <div className="placeholder-content">
                <h4>Нема селектиран јазол</h4>
                <p>
                  Кликнете или пребарајте јазол во графикот за да видите детални
                  информации.
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

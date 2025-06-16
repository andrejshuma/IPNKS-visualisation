import React, { useState, useEffect } from "react";
import "./Sidebar.css";
import { useGlobalContext } from "../GlobalProvider.jsx";

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const {
    selectedNode,
    selectedNodeDetails,
    setSearchedMentor,
    activeNodeFilter,
  } = useGlobalContext();

  // Check for mobile screen size
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      const mobile = width <= 1300;
      setWindowWidth(width);
      setIsMobile(mobile);
      if (mobile) {
        setIsCollapsed(true); // Start collapsed on mobile
      }
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <aside
      className={`sidebar ${isCollapsed ? "collapsed" : ""} ${
        isMobile ? "mobile" : ""
      }`}
    >
      <div className="sidebar-header">
        <button className="toggle-btn" onClick={toggleSidebar}>
          {windowWidth <= 1300
            ? isCollapsed
              ? "↑"
              : "↓"
            : isCollapsed
            ? "→"
            : "←"}
        </button>
        {!isCollapsed && (
          <h3 style={{ textAlign: windowWidth <= 1300 ? "center" : "right" }}>
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
              {/* Desktop Layout */}
              <div className="desktop-layout">
                <div className="sidebar-section">
                  <h4>Информации за професор</h4>
                  <div className="info-item">
                    <span className="info-label">Име:</span>
                    <span className="info-value">
                      {selectedNodeDetails.name}
                    </span>
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
                        {selectedNodeDetails.mentorCollaborations.map(
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
                      <p className="no-data">
                        Нема податоци за менторства
                        {activeNodeFilter.min != null &&
                          activeNodeFilter.max != null && (
                            <>
                              {" "}
                              со колаборации во рангот од {
                                activeNodeFilter.min
                              }{" "}
                              до {activeNodeFilter.max}
                            </>
                          )}
                        {activeNodeFilter.min != null &&
                          activeNodeFilter.max == null && (
                            <>
                              {" "}
                              со колаборации во рангот од {
                                activeNodeFilter.min
                              }{" "}
                              до ∞
                            </>
                          )}
                        {activeNodeFilter.min == null &&
                          activeNodeFilter.max != null && (
                            <>
                              {" "}
                              со колаборации во рангот од 0 до{" "}
                              {activeNodeFilter.max}
                            </>
                          )}
                      </p>
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
                        {selectedNodeDetails.memberCollaborations.map(
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
                      <p className="no-data">
                        Нема податоци за членства
                        {activeNodeFilter.min != null &&
                          activeNodeFilter.max != null && (
                            <>
                              {" "}
                              со колаборации во рангот од {
                                activeNodeFilter.min
                              }{" "}
                              до {activeNodeFilter.max}
                            </>
                          )}
                        {activeNodeFilter.min != null &&
                          activeNodeFilter.max == null && (
                            <>
                              {" "}
                              со колаборации во рангот од {
                                activeNodeFilter.min
                              }{" "}
                              до ∞
                            </>
                          )}
                        {activeNodeFilter.min == null &&
                          activeNodeFilter.max != null && (
                            <>
                              {" "}
                              со колаборации во рангот од 0 до{" "}
                              {activeNodeFilter.max}
                            </>
                          )}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Mobile/Tablet Layout (992px and below) */}
              <div className="mobile-layout">
                <div className="professor-card">
                  <div className="professor-header">
                    <div className="professor-avatar">👤</div>
                    <div className="professor-details">
                      <h3 className="professor-name">
                        {selectedNodeDetails.name}
                      </h3>
                      <p className="professor-title">Професор</p>
                    </div>
                  </div>

                  <div className="stats-grid">
                    <div className="stat-card">
                      <div className="stat-number">
                        {selectedNodeDetails.totalCollaborations}
                      </div>
                      <div className="stat-label">Соработки</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-number">
                        {selectedNodeDetails.mentorCount}
                      </div>
                      <div className="stat-label">Менторства</div>
                    </div>
                  </div>
                </div>

                <div className="collaboration-cards">
                  <div className="collaboration-card">
                    <div className="card-header">
                      <div className="card-icon">👥</div>
                      <h4>Као ментор</h4>
                    </div>
                    <div className="card-content">
                      {selectedNodeDetails.mentorCollaborations.length > 0 ? (
                        <div className="collaborator-list">
                          {selectedNodeDetails.mentorCollaborations
                            .slice(0, 5)
                            .map((member, index) => (
                              <div
                                key={index}
                                className="collaborator-item"
                                onClick={() =>
                                  setSearchedMentor(member.name || member)
                                }
                              >
                                <span className="collaborator-name">
                                  {typeof member === "object"
                                    ? member.name
                                    : member}
                                </span>
                                {typeof member === "object" && (
                                  <span className="collaborator-weight">
                                    {member.weight}
                                  </span>
                                )}
                              </div>
                            ))}
                          {selectedNodeDetails.mentorCollaborations.length >
                            5 && (
                            <div className="more-indicator">
                              +
                              {selectedNodeDetails.mentorCollaborations.length -
                                5}{" "}
                              повеќе
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="empty-state">
                          <span className="empty-icon">📋</span>
                          <p>Нема податоци за менторства</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="collaboration-card">
                    <div className="card-header">
                      <div className="card-icon">🎓</div>
                      <h4>Како член</h4>
                    </div>
                    <div className="card-content">
                      {selectedNodeDetails.memberCollaborations.length > 0 ? (
                        <div className="collaborator-list">
                          {selectedNodeDetails.memberCollaborations
                            .slice(0, 5)
                            .map((mentor, index) => (
                              <div
                                key={index}
                                className="collaborator-item"
                                onClick={() =>
                                  setSearchedMentor(mentor.name || mentor)
                                }
                              >
                                <span className="collaborator-name">
                                  {typeof mentor === "object"
                                    ? mentor.name
                                    : mentor}
                                </span>
                                {typeof mentor === "object" && (
                                  <span className="collaborator-weight">
                                    {mentor.weight}
                                  </span>
                                )}
                              </div>
                            ))}
                          {selectedNodeDetails.memberCollaborations.length >
                            5 && (
                            <div className="more-indicator">
                              +
                              {selectedNodeDetails.memberCollaborations.length -
                                5}{" "}
                              повеќе
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="empty-state">
                          <span className="empty-icon">📋</span>
                          <p>Нема податоци за членства</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="no-selection">
              <div className="placeholder-content">
                <div className="placeholder-icon">📊</div>
                <h4>Нема селектиран јазол</h4>
                <p>
                  Кликнете или пребарајте јазол во графикот за да видите детални
                  информации.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </aside>
  );
};

export default Sidebar;

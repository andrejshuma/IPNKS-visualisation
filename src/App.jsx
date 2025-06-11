import { useState } from "react";
import "./App.css";
import Navigation from "./components/Navigation";
import Sidebar from "./components/Sidebar";
import GraphNavbar from "./components/GraphNavbar";
import GraphView from "./components/GraphView";

function App() {
  const [selectedNode, setSelectedNode] = useState(null);

  const handleNodeClick = (node) => {
    setSelectedNode(node);
  };

  return (
    <div className="app">
      <Navigation />
      <div className="app-body">
        <main className="main-content">
          <div className="graph-container">
            <GraphNavbar />
            <div className="graph-view-container">
              <GraphView onNodeClick={handleNodeClick} />
            </div>
          </div>
        </main>
        <Sidebar selectedNode={selectedNode} />
      </div>
    </div>
  );
}

export default App;

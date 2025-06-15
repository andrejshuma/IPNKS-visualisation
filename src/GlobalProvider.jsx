import React, { createContext, useState, useContext } from "react";

const GlobalContext = createContext();

export const GlobalProvider = ({ children }) => {
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedNodeDetails, setSelectedNodeDetails] = useState(null);
  const [searchedMentor, setSearchedMentor] = useState(null);
  const [selectedGraphLayout, setSelectedGraphLayout] = useState("random");
  const [nodeAddSize, setNodeAddSize] = useState(0);
  const [edgeAddSize, setEdgeAddSize] = useState(0);
  const [minInteractions, setMinInteractions] = useState("");
  const [maxInteractions, setMaxInteractions] = useState("");
  const [activeNodeFilter, setActiveNodeFilter] = useState({
    min: null,
    max: null,
  });

  return (
    <GlobalContext.Provider
      value={{
        selectedNode,
        setSelectedNode,
        selectedNodeDetails,
        setSelectedNodeDetails,
        searchedMentor,
        setSearchedMentor,
        selectedGraphLayout,
        setSelectedGraphLayout,
        nodeAddSize,
        setNodeAddSize,
        edgeAddSize,
        setEdgeAddSize,
        minInteractions,
        setMinInteractions,
        maxInteractions,
        setMaxInteractions,
        activeNodeFilter,
        setActiveNodeFilter,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = () => useContext(GlobalContext);

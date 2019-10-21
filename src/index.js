import React from "react";
import ReactDOM from "react-dom";
import GlobetotterHandler from "./GlobetotterHandler";

function App() {
  return <GlobetotterHandler />;
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);

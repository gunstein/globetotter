import React from "react";
import ReactDOM from "react-dom";
import GlobetotterHandler from "./GlobetotterHandler/GlobetotterHandler";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

function App() {
  return (
    <Router>
      <Switch>
        <Route exact path="/">
          <GlobetotterHandler />
        </Route>
        <Route path="/:globename">
          <GlobetotterHandler />
        </Route>
      </Switch>
    </Router>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);

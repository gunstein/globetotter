import React, { useState, useEffect, createRef } from "react";
import ReactDOM from "react-dom";
import AppBar from "@material-ui/core/AppBar";
import Navbar from "./navbar";
import Toolbar from "@material-ui/core/Toolbar";
import TypoGraphy from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import client from "./HasuraApolloClient";
import { ApolloProvider } from "@apollo/react-hooks";

import "./styles.css";
import "./web-components/SphereDrawThreejs";
import { StylesContext } from "@material-ui/styles/StylesProvider";
import SingleGlobeHandler from "./SingleGlobeHandler/SingleGlobeHandler";

function App() {
  return (
    //<div className="App">
    <div>
      <ApolloProvider client={client}>
        <AppBar color="primary" position="static">
          <Toolbar>
            <TypoGraphy variant="subtitle1" color="inherit">
              My header
            </TypoGraphy>
            <Navbar />
          </Toolbar>
        </AppBar>
        <SingleGlobeHandler globeid="1" />
      </ApolloProvider>
    </div>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);

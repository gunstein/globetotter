import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import AppBar from "@material-ui/core/AppBar";
import Navbar from "./navbar";
import Toolbar from "@material-ui/core/Toolbar";
import TypoGraphy from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import ApolloClient from "apollo-boost";
import { ApolloProvider } from "@apollo/react-hooks";

import "./styles.css";

import "./web-components/SphereDrawThreejs";

function App() {
  //const handleGvtest123 = event => console.log("gvtest123");
  /*function handleGvtest123() {
    console.log("gvtest123");
  }
  */
  const [tekst, setTekst] = useState("tull");
  const handler = event => {
    //function handler(event) {
    event.preventDefault();
    //console.log("gvtest123");
    //console.log(event);
    //const onChange = useCallback(e => setSlide(e.value), []);
    setTekst(JSON.stringify(event.detail));
    //setTekst("bullshit");
    //console.log({ tekst });
  };

  useEffect(() => {
    window.addEventListener("SphereDrawAction", handler);
    // clean up
    return () => window.removeEventListener("SphereDrawAction", handler);
  }, []); // empty array => run only once

  return (
    //<div className="App">
    <div>
      <AppBar color="primary" position="static">
        <Toolbar>
          <TypoGraphy variant="subtitle1" color="inherit">
            My header
          </TypoGraphy>
          <Navbar />
        </Toolbar>
      </AppBar>
      <TextField
        id="standard-name"
        margin="normal"
        variant="outlined"
        fullWidth
        multiline
        rows={2}
        value={tekst}
      />
      {<spheredraw-threejs-element />}
    </div>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);

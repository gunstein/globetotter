import React, { useState, useEffect, createRef } from "react";
import ReactDOM from "react-dom";
import AppBar from "@material-ui/core/AppBar";
import Navbar from "./navbar";
import Toolbar from "@material-ui/core/Toolbar";
import TypoGraphy from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import client from "./HasuraApolloClient";
import { ApolloProvider } from "@apollo/react-hooks";
import { useSubscription } from "@apollo/react-hooks";
import globetotterSubscription from "./graphql/subscriptions/GlobetotterSubscription";
import InsertGlobetotterLog from "./graphql/mutations/InsertGlobetotterLog";

import "./styles.css";
import "./web-components/SphereDrawThreejs";
import { StylesContext } from "@material-ui/styles/StylesProvider";

const SubscribeToGlobeActions = ({ onSendMessage }) => {
  const { data, error, loading } = useSubscription(globetotterSubscription, {
    variables: { globeid: 1 }
  });
  if (loading) {
    return <div>Loading...</div>;
  }
  if (error) {
    return <div>Error! {error.message}</div>;
  }
  console.log(data);
  onSendMessage(data);
  return null;
};

function App() {
  const [tekst, setTekst] = useState("tull");
  const ref = createRef();

  const handleGlobeChange = message => {
    console.log(message);
    setTekst(JSON.stringify(message));
    //Får beskjed av subscription når det dukker opp nye transaksjoner

    //Kjør spørring for å hente ut endringer?
    if (typeof ref.current === "undefined") {
      console.log("ref er undefined");
    } else if (ref.current === null) {
      console.log("ref er null");
    } else {
      console.log(ref.current);
      console.log(ref.current.RADIUS);
    }
  };

  useEffect(() => {
    const sphereDrawHandler = event => {
      event.preventDefault();
      //setTekst(JSON.stringify(event.detail));
    };
    window.addEventListener("SphereDrawAction", sphereDrawHandler);

    // clean up
    return () =>
      window.removeEventListener("SphereDrawAction", sphereDrawHandler);
  }, []); // empty array => run only once

  return (
    //<div className="App">
    <div>
      <ApolloProvider client={client}>
        <SubscribeToGlobeActions onSendMessage={handleGlobeChange} />
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
        <spheredraw-threejs-element ref={ref} globeid="1" />
      </ApolloProvider>
    </div>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);

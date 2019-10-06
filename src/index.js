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
import SingleGlobeHandler from "./SingleGlobeHandler";

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

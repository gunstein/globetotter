import React, { useState, useEffect, createRef } from "react";
import ReactDOM from "react-dom";
import AppBar from "@material-ui/core/AppBar";
import Navbar from "./navbar";
import Toolbar from "@material-ui/core/Toolbar";
import TypoGraphy from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import client from "./HasuraApolloClient";
import { ApolloProvider } from "@apollo/react-hooks";
import { useSubscription, useLazyQuery } from "@apollo/react-hooks";
import globetotterSubscription from "./graphql/subscriptions/GlobetotterSubscription";
import InsertGlobetotterLog from "./graphql/mutations/InsertGlobetotterLog";

import "./styles.css";
import "./web-components/SphereDrawThreejs";

const SubscribeToGlobeActions = ({globidparam, handleGlobeSubscription }) => {
  const { data, error, loading } = useSubscription(globetotterSubscription, {
    variables: { globeid: globeidparam }
  });
  if (loading) {
    return <div>Loading...</div>;
  }
  if (error) {
    return <div>Error! {error.message}</div>;
  }
  console.log(data);
  handleGlobeSubscription(data);
  return null;
};

function DelayedGlobeQuery({globeid, handleGlobeActions}) {
  //const [dog, setDog] = useState(null);
  const [getGlobeActions, { loading, data }] = useLazyQuery(GET_DOG_PHOTO);

  if (loading) return <p>Loading ...</p>;

  if (data && data.globetotter_log ){
    //setDog(data.dog);
    handleGlobeActions(data.globetotter_log)
  }

  return null;
}

const SingleGlobeHandler = ({ globeid_param }) => {
  const [ignoreSubscription, setIgnoreSubscription] = useState(true);
  const [globeid, setGlobeid] = useState(globeid_param);
  const [lastTransaction, setLastTransaction] = useState(0);
  const refGlobeQuery = createRef();
  const refSphereDraw = createRef();

  useEffect(() => {
    //Håndter meldinger/action fra globen
    const sphereDrawHandler = event => {
      event.preventDefault();
    };
    window.addEventListener("SphereDrawAction", sphereDrawHandler);

    // clean up
    return () =>
      window.removeEventListener("SphereDrawAction", sphereDrawHandler);
  }, []); // empty array => run only once

  useEffect(() => {
    //utfør spørring, lazyquery

  }, []); 
 
  return {
    //Subscription
    <SubscribeToGlobeActions {globeidparam} onSendMessage={handleGlobeSubscription} />
    //Query
    <DelayedGlobeQuery ref={refSphereDraw} {globeidparam}/>
    //Webcomponent
    <spheredraw-threejs-element ref={refSphereDraw} globeid={globeidparam} />
  };
};

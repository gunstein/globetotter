import React, { useState } from "react";
import SphereDrawWrapper from "../web-components/SphereDrawWrapper";
import InsertGlobetotterLog from "./InsertGlobetotterLog";
import SubscribeToGlobeActions from "./SubscribeToGlobeActions";
import QueryGlobetotterLog from "./QueryGlobetotterLog";

const SingleGlobeHandler = ({ globeid }) => {
  const [subscriptionMode, setSubscriptonMode] = useState(0); //Ensure query is run before subscription start

  const [lastTransactionReceived, setLastTransactionReceived] = useState(0); //set vi handlequery
  const [lastTransactionOnServer, setLastTransactionOnServer] = useState(0); //Set via subscription

  const [lastActionFromServer, setLastActionFromServer] = useState("");
  const [lastActionFromSphere, setLastActionFromSphere] = useState("");

  const handleQuery = queryResult => {
    if (subscriptionMode === 0) {
      setSubscriptonMode(1);
    }
    if (queryResult.length === 0) {
      return null;
    }

    //go through action(s) and set lastTransactionReceived
    let temptrans = 0;
    if (Array.isArray(queryResult)) {
      queryResult.forEach(singleaction => {
        if (singleaction.id > temptrans) {
          temptrans = singleaction.id;
        }
      });
    } else if (queryResult.id > temptrans) {
      temptrans = queryResult.id;
    }

    if (temptrans > lastTransactionReceived) {
      setLastTransactionReceived(temptrans);
    }

    setLastActionFromServer(JSON.stringify(queryResult));
  };

  const handleSubscription = lastTransQueryResult => {
    if (lastTransQueryResult.globetotter_log.length !== 1) {
      //Empty globe, probably
      console.log(
        "handleSubscription lastTransQueryResult should have exactly one element."
      );
      return null;
    }
    const temptrans = lastTransQueryResult.globetotter_log[0].id;
    if (temptrans > lastTransactionOnServer) {
      setSubscriptonMode(0);
      setLastTransactionOnServer(temptrans);
    }
  };

  const handleSphereDrawAction = action => {
    //Run mutation to update Hasura
    setLastActionFromSphere(action);
    return null;
  };

  return (
    <div>
      <InsertGlobetotterLog action={lastActionFromSphere} />
      {subscriptionMode ? (
        <SubscribeToGlobeActions
          globeidparam={globeid}
          handleGlobeSubscription={handleSubscription}
        />
      ) : null}
      {!subscriptionMode ? (
        <QueryGlobetotterLog
          globeid={globeid}
          lasttrans={lastTransactionReceived}
          handleGlobeQuery={handleQuery}
        />
      ) : null}
      <SphereDrawWrapper
        globeid={globeid}
        lastaction={lastActionFromServer}
        onSphereDrawAction={handleSphereDrawAction}
      />
    </div>
  );
};

export default SingleGlobeHandler;

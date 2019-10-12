import React, { useState } from "react";
import SphereDrawWrapper from "../web-components/SphereDrawWrapper";
import InsertGlobetotterLog from "./InsertGlobetotterLog";
import SubscribeToGlobeActions from "./SubscribeToGlobeActions";
import GlobeQuery from "./GlobeQuery";

const SingleGlobeHandler = ({ globeid }) => {
  console.log("SingleGlobeHandler globeid: ", globeid);
  //const [globeid, setGlobeid] = useState(globeid_param);
  const [initialQueryHasRun, setInitialQueryHasRun] = useState(0); //Ensure query is ran before subscription start

  const [lastTransactionReceived, setLastTransactionReceived] = useState(0); //set vi handlequery
  const [lastTransactionOnServer, setLastTransactionOnServer] = useState(0); //Set via subscription

  const [lastActionFromServer, setLastActionFromServer] = useState("");
  const [lastActionFromSphere, setLastActionFromSphere] = useState("");

  const handleQuery = queryResult => {
    //Call setLastActionFromServer
    console.log("handleQuery queryResult :", queryResult);
    console.log("queryResult length: ", queryResult.length);
    if (initialQueryHasRun === 0) {
      setInitialQueryHasRun(1);
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
    //Call setLastTransaction
    console.log("handleSubscription: ", lastTransQueryResult);
    if (lastTransQueryResult.globetotter_log.length !== 1) {
      //Empty globe, probably
      console.log(
        "handleSubscription lastTransQueryResult should have exactly one element."
      );
      return null;
    }
    const temptrans = lastTransQueryResult.globetotter_log[0].id;
    if (temptrans > lastTransactionOnServer) {
      setLastTransactionOnServer(temptrans);
    }
  };

  const handleSphereDrawAction = action => {
    //Run mutation to update Hasura
    console.log("handleSphereDrawAction : ", action);
    setLastActionFromSphere(action);
    //setLastActionFromSphereCounter(lastActionFromSphereCounter + 1);
    return null;
  };
  //action_counter={lastActionFromSphereCounter}
  return (
    <div>
      <InsertGlobetotterLog action={lastActionFromSphere} />
      {initialQueryHasRun ? (
        <SubscribeToGlobeActions
          globeidparam={globeid}
          handleGlobeSubscription={handleSubscription}
        />
      ) : null}
      <GlobeQuery
        globeid={globeid}
        lasttrans={lastTransactionReceived}
        handleGlobeQuery={handleQuery}
      />
      <SphereDrawWrapper
        globeid={globeid}
        lastaction={lastActionFromServer}
        onSphereDrawAction={handleSphereDrawAction}
      />
    </div>
  );
};

export default SingleGlobeHandler;

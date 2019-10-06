import React, { useState, useMemo } from "react";
import { useSubscription, useQuery, useMutation } from "@apollo/react-hooks";
import SUBSCRIBE_GLOBETOTTER_LOG from "./graphql/subscriptions/GlobetotterSubscription";
import INSERT_GLOBETOTTER_LOG from "./graphql/mutations/InsertGlobetotterLog";
import QUERY_GLOBETOTTER_LOG from "./graphql/queries/GlobetotterQuery";
import SphereDrawWrapper from "./SphereDrawWrapper";

const InsertGlobetotterLog = action => {
  let [insertGlobetotterLog] = useMutation(INSERT_GLOBETOTTER_LOG);

  useMemo(() => {
    console.log("InsertGlobetotterLog useEffect action: ", action);
    //if (Object.keys(action).length === 0) {
    if (action.action === "") {
      return;
    }

    const actionobj = JSON.parse(action.action);
    //console.log("actionobj : ", actionobj);

    insertGlobetotterLog({
      variables: {
        globeId: actionobj.globeid,
        data: JSON.stringify(actionobj.data),
        operation: actionobj.actiontype,
        objUuid: actionobj.uuid
      }
    });
  }, [action]);

  return null;
};

const SubscribeToGlobeActions = ({ globeidparam, handleGlobeSubscription }) => {
  console.log("globeidparam", globeidparam);
  const { data, error, loading } = useSubscription(SUBSCRIBE_GLOBETOTTER_LOG, {
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

function GlobeQuery({ globeid, lasttrans, handleGlobeQuery }) {
  console.log("GlobeQuery globeid : ", globeid);
  console.log("GlobeQuery lasttrans : ", lasttrans);
  const { loading, error, data } = useQuery(QUERY_GLOBETOTTER_LOG, {
    variables: { globeid: globeid, last_transaction: lasttrans }
  });

  if (loading) return null;
  if (error) return `Error! ${error}`;

  if (data && data.globetotter_log) {
    handleGlobeQuery(data.globetotter_log);
  }

  return null;
}
/*
globetotter-huskelapp
Lag wrapper rundt web-component
Innfør state for current-action i SingleGlobe. Forhåpentligvis slipper man da alt sånn ref-styr.
I SingleGlobe får vi tre states globeid, last_transaction, last_action.
Vi får to handle funksjoner. handlesubscription og handlequery
handlesubscription setter last_transaction-state. Det medfører at handlequery kalles siden denne lytter på last-transaction-state. handlequery setter last-action-state.
last_actionstate-sendes til webcomp via state til wrapper.
Eventer fra webcomponent (tror jeg) må merkes med globeid sånn at ikke alle glober legger til samme action.
*/

const SingleGlobeHandler = ({ globeid }) => {
  console.log("SingleGlobeHandler globeid: ", globeid);
  //const [globeid, setGlobeid] = useState(globeid_param);
  const [lastTransaction, setLastTransaction] = useState(0);
  const [lastActionFromServer, setLastActionFromServer] = useState("");
  const [lastActionFromSphere, setLastActionFromSphere] = useState("");

  const handleQuery = queryResult => {
    //Call setLastActionFromServer
    console.log("handleQuery queryResult :", queryResult);
    console.log("queryResult length: ", queryResult.length);
    if (queryResult.length === 0) {
      return null;
    }
    setLastActionFromServer(JSON.stringify(queryResult));
  };

  const handleSubscription = lastTransQueryResult => {
    //Call setLastTransaction
    console.log("handleSubscription: ", lastTransQueryResult);
    if (lastTransQueryResult.globetotter_log.length !== 1) {
      //Error. Hvordan bør dette håndteres?
      console.log(
        "handleSubscription lastTransQueryResult should have exactly one element."
      );
      return null;
    }
    const temptrans = lastTransQueryResult.globetotter_log[0].id;
    console.log("temptrans: ", temptrans);
    setLastTransaction(temptrans);
  };

  const handleSphereDrawAction = action => {
    //Kjør mutation for å oppdatere hasura
    console.log("handleSphereDrawAction : ", action);
    setLastActionFromSphere(action);
    /*
    console.log("handleSphereDrawAction");
    console.log(action);
    let tempAction = JSON.parse(action);
    tempAction.data.position.x = tempAction.data.position.x + 4;
    tempAction.data.position.y = tempAction.data.position.y + 4;

    setLastAction(JSON.stringify(tempAction));
    */
    return null;
  };
  //return null;

  return (
    <div>
      <InsertGlobetotterLog action={lastActionFromSphere} />
      <SubscribeToGlobeActions
        globeidparam={globeid}
        handleGlobeSubscription={handleSubscription}
      />
      <GlobeQuery
        globeid={globeid}
        lasttrans={lastTransaction}
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

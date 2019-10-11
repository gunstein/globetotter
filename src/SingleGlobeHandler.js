import React, { useState, useEffect } from "react";
import { useSubscription, useQuery, useMutation } from "@apollo/react-hooks";
import SUBSCRIBE_GLOBETOTTER_LOG from "./graphql/subscriptions/GlobetotterSubscription";
import INSERT_GLOBETOTTER_LOG from "./graphql/mutations/InsertGlobetotterLog";
import QUERY_GLOBETOTTER_LOG from "./graphql/queries/GlobetotterQuery";
import SphereDrawWrapper from "./SphereDrawWrapper";
import Schema from "validate";

const InsertGlobetotterLog = ({ action }) => {
  let [insertGlobetotterLog] = useMutation(INSERT_GLOBETOTTER_LOG);

  useEffect(() => {
    console.log("InsertGlobetotterLog useEffect action: ", action);

    if (action === "") {
      return;
    }

    const actionobj = JSON.parse(action);

    //Check if action is ok
    const action_validator = new Schema({
      globe_id: {
        required: true,
        type: Number
      },
      object_data: {
        position: {
          x: {
            required: true
          },
          y: {
            required: true
          },
          z: {
            required: true
          }
        },
        color: {
          required: true,
          type: Number
        }
      },
      operation_id: {
        required: true,
        type: Number
      },
      object_uuid: {
        required: true
      },
      transaction_uuid: {
        required: true
      }
    });

    const errors = action_validator.validate(actionobj);

    console.log("actionobj.object_data", actionobj.object_data);
    console.log(
      "object_data stringify:",
      JSON.stringify(actionobj.object_data)
    );

    if (errors.length === 0) {
      insertGlobetotterLog({
        variables: {
          globeId: actionobj.globe_id,
          data: JSON.stringify(actionobj.object_data),
          operation: actionobj.operation_id,
          objUuid: actionobj.object_uuid,
          transUuid: actionobj.transaction_uuid
        }
      });
    } else {
      console.log("validation errors: ", errors);
    }
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
  const [initialQueryHasRun, setInitialQueryHasRun] = useState(0); //Ensure query is ran before subscription start
  const [lastTransactionReceived, setLastTransactionReceived] = useState(0);
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
    if (temptrans > lastTransactionReceived) {
      setLastTransactionReceived(temptrans);
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

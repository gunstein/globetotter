import React, { useState } from "react";
import SphereDrawWrapper from "../web-components/SphereDrawWrapper";
import InsertGlobetotterLog from "./InsertGlobetotterLog";
import SubscribeToGlobeActions from "./SubscribeToGlobeActions";
import QueryGlobetotterLog from "./QueryGlobetotterLog";
import Slider from "@material-ui/core/Slider";
import Tooltip from "@material-ui/core/Tooltip";
import PropTypes from "prop-types";

function ValueLabelComponent(props) {
  const { children, open, value } = props;

  const popperRef = React.useRef(null);
  React.useEffect(() => {
    if (popperRef.current) {
      popperRef.current.update();
    }
  });

  return (
    <Tooltip
      PopperProps={{
        popperRef
      }}
      open={open}
      enterTouchDelay={0}
      placement="top"
      title={value}
    >
      {children}
    </Tooltip>
  );
}

ValueLabelComponent.propTypes = {
  children: PropTypes.element.isRequired,
  open: PropTypes.bool.isRequired,
  value: PropTypes.number.isRequired
};

const SingleGlobeHandler = ({ globeid }) => {
  const [subscriptionMode, setSubscriptonMode] = useState(0); //Ensure query is run before subscription start

  const [lastTransactionReceived, setLastTransactionReceived] = useState(0); //set vi handlequery
  const [lastTransactionOnServer, setLastTransactionOnServer] = useState(0); //Set via subscription

  const [lastActionFromServer, setLastActionFromServer] = useState("");
  const [lastActionFromSphere, setLastActionFromSphere] = useState("");

  const [minHistorySlider, setMinHistorySlider] = useState(0);
  const [maxHistorySlider, setMaxHistorySlider] = useState(100);
  const [currentHistorySliderValue, setCurrentHistorySliderValue] = useState(0);

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

  const handleHistoryLimitChange = newLimits => {
    //set limits
    const limits = JSON.parse(newLimits);
    setMinHistorySlider(limits.min);
    setMaxHistorySlider(limits.max);
    return null;
  };

  const handleSliderChangeCommitted = (event, newValue) => {
    setCurrentHistorySliderValue(newValue);
  };

  return (
    <React.Fragment>
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
        timeHistory={currentHistorySliderValue}
        onSphereDrawAction={handleSphereDrawAction}
        onHistoryLimitChange={handleHistoryLimitChange}
      />
      <Slider
        ValueLabelComponent={ValueLabelComponent}
        aria-label="custom thumb label"
        onChangeCommitted={handleSliderChangeCommitted}
        defaultValue={maxHistorySlider}
        min={minHistorySlider}
        max={maxHistorySlider}
      />
    </React.Fragment>
  );
};

export default SingleGlobeHandler;

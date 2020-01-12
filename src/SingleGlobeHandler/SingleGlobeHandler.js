import React, { useState } from "react";
import SphereDrawWrapper from "../web-components/SphereDrawWrapper";
import InsertGlobetotterLog from "./InsertGlobetotterLog";
import SubscribeToGlobeActions from "./SubscribeToGlobeActions";
import QueryGlobetotterLog from "./QueryGlobetotterLog";
import Slider from "@material-ui/core/Slider";
import Tooltip from "@material-ui/core/Tooltip";
import PropTypes from "prop-types";
import DrawingSettingsDialog from "./DrawingSettingsDialog";
import { makeStyles } from "@material-ui/core/styles";

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
      title={new Date(value).toISOString()}
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

//Todo: begynn å bruke denne for dialogen til meny.
const useStyles = makeStyles(theme => ({
  overlay_dialog: {
    position: "absolute",
    top: "20px",
    left: "20px",
    color: "black",
    backgroundColor: "red"
  }
}));

const SingleGlobeHandler = ({ globeid }) => {
  const classes = useStyles();
  const [subscriptionMode, setSubscriptonMode] = useState(0); //Ensure query is run before subscription start

  const [lastTransactionReceived, setLastTransactionReceived] = useState(0); //set vi handlequery
  const [lastTransactionOnServer, setLastTransactionOnServer] = useState(0); //Set via subscription

  const [lastActionFromServer, setLastActionFromServer] = useState("");
  const [lastActionFromSphere, setLastActionFromSphere] = useState("");

  const [minHistorySlider, setMinHistorySlider] = useState(0);
  const [maxHistorySlider, setMaxHistorySlider] = useState(100);
  const [currentHistoryValue, setCurrentHistoryValue] = useState(-1);

  const [sliderValue, setSliderValue] = useState(100);

  const [currentColor, setCurrentColor] = useState("#e91e63");
  const [currentOperation, setCurrentOperation] = useState(1);

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
    const sliderOnMax = sliderValue && maxHistorySlider;
    const limits = JSON.parse(newLimits);
    setMinHistorySlider(limits.history_min);
    let newMax = 0;
    if (limits.history_max === null) {
      newMax = new Date().getTime();
    } else {
      newMax = limits.history_max;
    }
    setMaxHistorySlider(newMax);
    if (sliderOnMax) {
      setSliderValue(newMax);
    }
    return null;
  };

  const handleSliderChange = (event, newValue) => {
    setSliderValue(newValue);
  };

  const handleSliderChangeCommitted = (event, newValue) => {
    if (newValue === maxHistorySlider) {
      setCurrentHistoryValue(-1);
    } else {
      setCurrentHistoryValue(newValue);
    }
    setSliderValue(newValue);
  };

  const handleDrawingSettings = (operation, color) => {
    setCurrentOperation(operation);
    setCurrentColor(color);
    return null;
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
        timeHistory={currentHistoryValue}
        currentColor={currentColor}
        currentOperation={currentOperation}
        onSphereDrawAction={handleSphereDrawAction}
        onHistoryLimitChange={handleHistoryLimitChange}
      />
      <Slider
        ValueLabelComponent={ValueLabelComponent}
        aria-label="custom thumb label"
        onChangeCommitted={handleSliderChangeCommitted}
        onChange={handleSliderChange}
        defaultValue={maxHistorySlider}
        min={minHistorySlider}
        max={maxHistorySlider}
        value={sliderValue}
      />
      <div style={{ position: "absolute", top: "50px", left: "30px" }}>
        <DrawingSettingsDialog handleDrawingSettings={handleDrawingSettings} />
      </div>
    </React.Fragment>
  );
};

export default SingleGlobeHandler;

import React, { useState } from "react";
import SphereDrawWrapper from "../web-components/SphereDrawWrapper";
import InsertGlobetotterLog from "./InsertGlobetotterLog";
import SubscribeToGlobeActions from "./SubscribeToGlobeActions";
import QueryGlobetotterLog from "./QueryGlobetotterLog";
import Slider from "@material-ui/core/Slider";
import Tooltip from "@material-ui/core/Tooltip";
import PropTypes from "prop-types";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import CssBaseline from "@material-ui/core/CssBaseline";
import IconButton from "@material-ui/core/IconButton";
import MenuIcon from "@material-ui/icons/Menu";
import clsx from "clsx";
import Drawer from "@material-ui/core/Drawer";

const drawerWidth = 240;

const useStyles = makeStyles(theme => ({
  root: {
    display: "flex"
  },
  appBar: {
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    })
  },
  appBarShift: {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: drawerWidth,
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen
    })
  },
  menuButton: {
    marginRight: theme.spacing(2)
  },
  hide: {
    display: "none"
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0
  },
  drawerPaper: {
    width: drawerWidth
  },
  drawerHeader: {
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(0, 1),
    ...theme.mixins.toolbar,
    justifyContent: "flex-end"
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    }),
    marginLeft: -drawerWidth
  },
  contentShift: {
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen
    }),
    marginLeft: 0
  }
}));

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

const SingleGlobeHandler = ({ globeid }) => {
  const [subscriptionMode, setSubscriptonMode] = useState(0); //Ensure query is run before subscription start

  const [lastTransactionReceived, setLastTransactionReceived] = useState(0); //set vi handlequery
  const [lastTransactionOnServer, setLastTransactionOnServer] = useState(0); //Set via subscription

  const [lastActionFromServer, setLastActionFromServer] = useState("");
  const [lastActionFromSphere, setLastActionFromSphere] = useState("");

  const [minHistorySlider, setMinHistorySlider] = useState(0);
  const [maxHistorySlider, setMaxHistorySlider] = useState(100);
  const [currentHistoryValue, setCurrentHistoryValue] = useState(-1);

  const [sliderValue, setSliderValue] = useState(100);

  const classes = useStyles();
  const theme = useTheme();
  const [open, setOpen] = React.useState(false);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

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
    //setSliderValue(newValue);
    if (newValue === maxHistorySlider) {
      setCurrentHistoryValue(-1);
    } else {
      setCurrentHistoryValue(newValue);
    }
    setSliderValue(newValue);
  };

  return (
    <div className={classes.root}>
      <CssBaseline />
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

      <IconButton
        color="inherit"
        aria-label="open drawer"
        onClick={handleDrawerOpen}
        edge="start"
        className={clsx(classes.menuButton, open && classes.hide)}
      >
        <MenuIcon />
      </IconButton>
      <Drawer
        className={classes.drawer}
        variant="persistent"
        anchor="left"
        open={open}
        classes={{
          paper: classes.drawerPaper
        }}
      />
      <SphereDrawWrapper
        globeid={globeid}
        lastaction={lastActionFromServer}
        timeHistory={currentHistoryValue}
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
    </div>
  );
};

export default SingleGlobeHandler;

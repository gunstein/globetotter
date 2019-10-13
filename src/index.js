import React from "react";
import ReactDOM from "react-dom";
import AppBar from "@material-ui/core/AppBar";
import Navbar from "./navbar";
import Toolbar from "@material-ui/core/Toolbar";
import TypoGraphy from "@material-ui/core/Typography";
import client from "./HasuraApolloClient";
import { ApolloProvider } from "@apollo/react-hooks";

import "./styles.css";
import "./web-components/SphereDrawThreejs";
import { makeStyles } from "@material-ui/core/styles";
import SingleGlobeHandler from "./SingleGlobeHandler/SingleGlobeHandler";

import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: "center",
    color: theme.palette.text.secondary
  }
}));

function App() {
  const classes = useStyles();
  return (
    <div className={classes.root}>
      <ApolloProvider client={client}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper className={classes.paper}>
              <AppBar color="primary" position="static">
                <Toolbar>
                  <TypoGraphy variant="subtitle1" color="inherit">
                    My header
                  </TypoGraphy>
                  <Navbar />
                </Toolbar>
              </AppBar>
            </Paper>
          </Grid>
          <Grid item xs={6}>
            <Paper className={classes.paper}>
              <SingleGlobeHandler globeid="1" />
            </Paper>
          </Grid>
          <Grid item xs={6}>
            <Paper className={classes.paper}>
              <SingleGlobeHandler globeid="1" />
            </Paper>
          </Grid>
        </Grid>
      </ApolloProvider>
    </div>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);

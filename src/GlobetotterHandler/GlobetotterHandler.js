import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import AsyncCreatableSelect from "react-select/async-creatable";
import Box from "@material-ui/core/Box";
import SingleGlobeHandler from "../SingleGlobeHandler/SingleGlobeHandler";
import client from "../graphql/HasuraApolloClient";
import { ApolloProvider } from "@apollo/react-hooks";
import gql from "graphql-tag";
import Snackbar from "@material-ui/core/Snackbar";
import Fab from "@material-ui/core/Fab";
import CloseIcon from "@material-ui/icons/Close";
import { useParams } from "react-router-dom";
import uuidv4 from "../utils/uuidv4";
import QueryGlobetotterGlobe from "./QueryGlobetotterGlobe";

const useStyles = makeStyles(theme => ({
  root: {
    //flexGrow: 1,
  },
  paper: {
    position: "relative",
    padding: theme.spacing(2),
    textAlign: "center",
    color: theme.palette.text.secondary
  },
  close: {
    position: "absolute",
    top: theme.spacing(2),
    right: theme.spacing(2)
  },
  globename: {
    position: "absolute",
    top: theme.spacing(2),
    left: theme.spacing(2)
  }
}));

export default function GlobetotterHandler() {
  const [initMode, setInitMode] = useState(1);
  const globenameParam = useParams();
  const classes = useStyles();
  const [globeidArray, setGlobeidArray] = useState([]);
  const [stateSnackbar, setStateSnackbar] = useState({
    open: false,
    vertical: "top",
    horizontal: "center"
  });

  const handleParameterGlobeQuery = queryResult => {
    if (queryResult.length > 0) {
      addGlobe({
        label: queryResult[0].name,
        value: queryResult[0].id
      });
    }
    setInitMode(0);
  };

  const { vertical, horizontal, open } = stateSnackbar;

  const handleCloseGlobe = uuidkey => {
    //find element by uuid and remove it.
    const index = globeidArray.map(e => e.uuid).indexOf(uuidkey);
    var tempArray = [...globeidArray]; // make a separate copy of the array
    tempArray.splice(index, 1);
    setGlobeidArray(tempArray);
  };

  const addGlobe = globe => {
    if (globeidArray.length >= 4) {
      setStateSnackbar({ ...stateSnackbar, open: true });
      return;
    }
    const newGlobe = { ...globe, uuid: uuidv4() };
    setGlobeidArray([...globeidArray, newGlobe]);
  };

  const fetchGlobes = async (input, cb) => {
    const res = await client.query({
      fetchPolicy: "no-cache",
      query: gql`
        query {
          globetotter_globe(
            limit: 10
            where: { name: { _ilike: "%${input}%" } }
          ) {
            name
            id
          }
        }
      `
    });

    if (res.data && res.data.globetotter_globe) {
      return res.data.globetotter_globe.map(a => ({
        label: a.name,
        value: a.id
      }));
    }

    return [];
  };

  const handleCloseSnackbar = () => {
    setStateSnackbar({ ...stateSnackbar, open: false });
  };

  const newGlobe = async (input, cb) => {
    if (globeidArray.length >= 4) {
      setStateSnackbar({ ...stateSnackbar, open: true });
      return;
    }
    const res = await client.mutate({
      fetchPolicy: "no-cache",
      mutation: gql`
        mutation MutationInsertGlobe {
          insert_globetotter_globe(objects: { name: "${input}" }) {
            returning {
              name
              id
            }
            affected_rows
          }
        }
      `
    });
    if (res.data && res.data.insert_globetotter_globe.affected_rows === 1) {
      addGlobe({
        label: res.data.insert_globetotter_globe.returning[0].name,
        value: res.data.insert_globetotter_globe.returning[0].id
      });
    }
  };

  const SetInitModeToFalseAndReturnNull = () => {
    setInitMode(0);
    return null;
  };

  return (
    <ApolloProvider client={client}>
      {initMode && Object.keys(globenameParam).length !== 0 ? (
        <QueryGlobetotterGlobe
          name={globenameParam}
          handleParameterGlobeQuery={handleParameterGlobeQuery}
        />
      ) : (
        <SetInitModeToFalseAndReturnNull />
      )}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={2}>
          <Box width="100%" p={1}>
            <Typography p={2} variant="h6">
              Globetotter
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} sm={10}>
          <Box display="flex" p={1} bgcolor="background.paper">
            <Box width="100%">
              <AsyncCreatableSelect
                loadOptions={fetchGlobes}
                defaultOptions
                onCreateOption={newGlobe}
                onChange={addGlobe}
              />
            </Box>
          </Box>
        </Grid>
        {globeidArray.map(globe => (
          <Grid
            item
            xs={12}
            sm={globeidArray.length === 1 ? 12 : 6}
            key={globe.uuid}
          >
            <Paper className={classes.paper}>
              <Typography className={classes.globename} p={1} variant="caption">
                {globe.label}
              </Typography>
              <Fab
                color="default"
                aria-label="close"
                size="small"
                onClick={() => handleCloseGlobe(globe.uuid)}
                className={classes.close}
              >
                <CloseIcon />
              </Fab>
              <SingleGlobeHandler globeid={globe.value} />
            </Paper>
          </Grid>
        ))}
      </Grid>
      <Snackbar
        anchorOrigin={{ vertical, horizontal }}
        key={`${vertical},${horizontal}`}
        open={open}
        onClose={handleCloseSnackbar}
        ContentProps={{
          "aria-describedby": "message-id"
        }}
        message={<span id="message-id">Max 4 globes</span>}
      />
    </ApolloProvider>
  );
}

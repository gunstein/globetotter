import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import AsyncCreatableSelect from "react-select/async-creatable";
import Box from "@material-ui/core/Box";
import SingleGlobeHandler from "./SingleGlobeHandler/SingleGlobeHandler";
import client from "./graphql/HasuraApolloClient";
import { ApolloProvider } from "@apollo/react-hooks";
import gql from "graphql-tag";
import "typeface-roboto";
import Snackbar from "@material-ui/core/Snackbar";

const useStyles = makeStyles(theme => ({
  root: {
    //flexGrow: 1,
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: "center",
    color: theme.palette.text.secondary
  }
}));

export default function GlobetotterHandler() {
  const classes = useStyles();
  const [globeidArray, setGlobeidArray] = useState([]);
  const [stateSnackbar, setStateSnackbar] = React.useState({
    open: false,
    vertical: "top",
    horizontal: "center"
  });

  const { vertical, horizontal, open } = stateSnackbar;

  const addGlobeid = globeid => {
    if (globeidArray.length >= 4) {
      setStateSnackbar({ ...stateSnackbar, open: true });
      return;
    }
    setGlobeidArray([...globeidArray, globeid.value]);
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
      addGlobeid({
        label: res.data.insert_globetotter_globe.returning[0].name,
        value: res.data.insert_globetotter_globe.returning[0].id
      });
    }
  };

  return (
    <div>
      <ApolloProvider client={client}>
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
                <Typography>
                  <AsyncCreatableSelect
                    loadOptions={fetchGlobes}
                    defaultOptions
                    onCreateOption={newGlobe}
                    onChange={addGlobeid}
                  />
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Paper className={classes.paper}>
              {globeidArray.length >= 1 ? (
                <SingleGlobeHandler globeid={globeidArray[0]} />
              ) : null}
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Paper className={classes.paper}>
              {globeidArray.length >= 2 ? (
                <SingleGlobeHandler globeid={globeidArray[1]} />
              ) : null}
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Paper className={classes.paper}>
              {globeidArray.length >= 3 ? (
                <SingleGlobeHandler globeid={globeidArray[2]} />
              ) : null}
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Paper className={classes.paper}>
              {globeidArray.length >= 4 ? (
                <SingleGlobeHandler globeid={globeidArray[3]} />
              ) : null}
            </Paper>
          </Grid>
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
    </div>
  );
}

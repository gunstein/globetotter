import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import AsyncSelect from "react-select/async";
import { colourOptions } from "./data";
import AddIcon from "@material-ui/icons/Add";
import Fab from "@material-ui/core/Fab";
import Box from "@material-ui/core/Box";
import SingleGlobeHandler from "./SingleGlobeHandler/SingleGlobeHandler";
import client from "./HasuraApolloClient";
import { ApolloProvider } from "@apollo/react-hooks";

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

  const filterColors = (inputValue: string) => {
    return colourOptions.filter(i =>
      i.label.toLowerCase().includes(inputValue.toLowerCase())
    );
  };

  const promiseOptions = inputValue =>
    new Promise(resolve => {
      setTimeout(() => {
        resolve(filterColors(inputValue));
      }, 1000);
    });
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
                <AsyncSelect
                  cacheOptions
                  defaultOptions
                  loadOptions={promiseOptions}
                />
              </Box>
              <Box ml={1}>
                <Fab size="small" color="default" aria-label="edit">
                  <AddIcon />
                </Fab>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Paper className={classes.paper}>
              <SingleGlobeHandler globeid="1" />
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Paper className={classes.paper}>
              <SingleGlobeHandler globeid="2" />
            </Paper>
          </Grid>
        </Grid>
      </ApolloProvider>
    </div>
  );
}

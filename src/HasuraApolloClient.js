import { ApolloClient } from "apollo-client";
import { InMemoryCache } from "apollo-cache-inmemory";
import { HttpLink } from "apollo-link-http";
import { WebSocketLink } from "apollo-link-ws";
import { split } from "apollo-link";
import { getMainDefinition } from "apollo-utilities";

const wsLink = new WebSocketLink({
  //uri: process.env.REACT_APP_GRAPHQL_SUBSCRIPTIONS_ENDPOINT,
  uri: "wss://globetotter.herokuapp.com/v1/graphql",
  options: {
    reconnect: true
  }
});

const httpLink = new HttpLink({
  //uri: process.env.REACT_APP_GRAPHQL_ENDPOINT,
  uri: "https://globetotter.herokuapp.com/v1/graphql"
  //credentials: "same-origin"
});

const link = split(
  ({ query }) => {
    const { kind, operation } = getMainDefinition(query);
    return kind === "OperationDefinition" && operation === "subscription";
  },
  wsLink,
  httpLink
);

const cache = new InMemoryCache();
const client = new ApolloClient({
  link,
  cache
});

export default client;

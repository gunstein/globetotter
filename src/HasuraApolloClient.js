import { ApolloClient } from "apollo-client";
import { InMemoryCache } from "apollo-cache-inmemory";
import { HttpLink } from "apollo-link-http";
import { onError } from "apollo-link-error";
import { ApolloLink } from "apollo-link";
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

// using the ability to split links, you can send data to each link
// depending on what kind of operation is being sent
/*
const link = split(
  // split based on operation type
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === "OperationDefinition" &&
      definition.operation === "subscription"
    );
  },
  wsLink,
  httpLink
);

const client = new ApolloClient({
  link: ApolloLink.from([
    onError(({ graphQLErrors, networkError }) => {
      if (graphQLErrors)
        graphQLErrors.forEach(({ message, locations, path }) =>
          console.error(
            `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
          )
        );
      if (networkError) console.error(`[Network error]: ${networkError}`);
    }),
    link
  ]),
  cache: new InMemoryCache()
});
*/
/*
// Instantiate client
const client = new ApolloClient({
  link,
  cache: new InMemoryCache()
})
*/
const link = split(
  ({ query }) => {
    const { kind, operation } = getMainDefinition(query);
    return kind === "OperationDefinition" && operation === "subscription";
  },
  wsLink,
  httpLink
);
const cache = new InMemoryCache();
const client = new ApolloClient({ link, cache });

export default client;

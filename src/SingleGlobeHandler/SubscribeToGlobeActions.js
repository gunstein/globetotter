import React from "react";
import { useSubscription } from "@apollo/react-hooks";
import SUBSCRIBE_GLOBETOTTER_LOG from "../graphql/subscriptions/GlobetotterSubscription";

const SubscribeToGlobeActions = ({ globeidparam, handleGlobeSubscription }) => {
  const { data, error, loading } = useSubscription(SUBSCRIBE_GLOBETOTTER_LOG, {
    fetchPolicy: "no-cache",
    variables: { globeid: globeidparam }
  });
  if (loading) {
    //return <div>Loading...</div>;
    return null;
  }
  if (error) {
    return <div>Error! {error.message}</div>;
  }
  handleGlobeSubscription(data);
  return null;
};

export default SubscribeToGlobeActions;

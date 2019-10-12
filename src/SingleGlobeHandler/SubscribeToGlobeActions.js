import React from "react";
import { useSubscription } from "@apollo/react-hooks";
import SUBSCRIBE_GLOBETOTTER_LOG from "../graphql/subscriptions/GlobetotterSubscription";

const SubscribeToGlobeActions = ({ globeidparam, handleGlobeSubscription }) => {
  console.log("globeidparam", globeidparam);
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
  console.log(data);
  handleGlobeSubscription(data);
  return null;
};

export default SubscribeToGlobeActions;

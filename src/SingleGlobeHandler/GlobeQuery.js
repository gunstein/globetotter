import React from "react";
import { useQuery } from "@apollo/react-hooks";
import QUERY_GLOBETOTTER_LOG from "../graphql/queries/GlobetotterQuery";

function GlobeQuery({ globeid, lasttrans, handleGlobeQuery }) {
  console.log("GlobeQuery globeid : ", globeid);
  console.log("GlobeQuery lasttrans : ", lasttrans);
  const { loading, error, data, refetch } = useQuery(QUERY_GLOBETOTTER_LOG, {
    fetchPolicy: "no-cache",
    variables: { globeid: globeid, last_transaction: lasttrans }
  });

  if (loading) return null;
  if (error) return `Error! ${error}`;

  if (data && data.globetotter_log) {
    handleGlobeQuery(data.globetotter_log);
  }
  //return null;
  return <button onClick={() => refetch()}>Refetch!</button>;
}

export default GlobeQuery;

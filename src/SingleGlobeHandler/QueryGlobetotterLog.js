import { useQuery } from "@apollo/react-hooks";
import QUERY_GLOBETOTTER_LOG from "../graphql/queries/GlobetotterLogQuery";

function QueryGlobetotterLog({ globeid, lasttrans, handleGlobeQuery }) {
  const { loading, error, data } = useQuery(QUERY_GLOBETOTTER_LOG, {
    fetchPolicy: "no-cache",
    variables: { globeid: globeid, last_transaction: lasttrans }
  });

  if (loading) return null;
  if (error) return `Error! ${error}`;

  if (data && data.globetotter_log) {
    handleGlobeQuery(data.globetotter_log);
  }
  return null;
}

export default QueryGlobetotterLog;

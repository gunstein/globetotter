import { useQuery } from "@apollo/react-hooks";
import QUERY_GLOBETOTTER_GLOBE from "./graphql/queries/GlobetotterGlobeQuery";

function QueryGlobetotterGlobe({ name, handleGlobeQuery }) {
  const { loading, error, data } = useQuery(QUERY_GLOBETOTTER_GLOBE, {
    fetchPolicy: "no-cache",
    variables: { name: name }
  });

  if (loading) return null;
  if (error) return `Error! ${error}`;

  if (data && data.globetotter_log) {
    return;
    //handleGlobeQuery(data.globetotter_log);
  }
  return null;
}

export default QueryGlobetotterGlobe;

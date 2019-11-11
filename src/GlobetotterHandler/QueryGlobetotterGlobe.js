import { useQuery } from "@apollo/react-hooks";
import QUERY_GLOBETOTTER_GLOBE from "../graphql/queries/GlobetotterGlobeQuery";

function QueryGlobetotterGlobe({ name, handleParameterGlobeQuery }) {
  const { loading, error, data } = useQuery(QUERY_GLOBETOTTER_GLOBE, {
    fetchPolicy: "no-cache",
    variables: { name: name.globename }
  });

  if (loading) return null;
  if (error) return `Error! ${error}`;

  if (data && data.globetotter_globe) {
    handleParameterGlobeQuery(data.globetotter_globe);
  }
  return null;
}

export default QueryGlobetotterGlobe;

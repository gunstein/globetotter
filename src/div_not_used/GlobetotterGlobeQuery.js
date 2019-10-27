import gql from "graphql-tag";

const QUERY_GLOBETOTTER_GLOBE = gql`
  query Globetotter_globe($name: String!) {
    globetotter_globe(
      limit: 10
      where: { name: { _ilike: "%$name}%" } }
      order_by: { name: asc }
    ) {
      name
      id
    }
  }
`;

export default QUERY_GLOBETOTTER_GLOBE;

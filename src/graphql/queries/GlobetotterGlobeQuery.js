import gql from "graphql-tag";

const QUERY_GLOBETOTTER_GLOBE = gql`
  query Globetotter_globe($name: String!) {
    globetotter_globe(limit: 1, where: { name: { _ilike: $name } }) {
      name
      id
    }
  }
`;

export default QUERY_GLOBETOTTER_GLOBE;

import gql from "graphql-tag";

const globetotterQuery = gql`
  {
    globetotter {
      id
      uuid
      tstamp
      data
    }
  }
`;

export default globetotterQuery;

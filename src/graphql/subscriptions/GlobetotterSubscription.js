import gql from "graphql-tag";

const SUBSCRIBE_GLOBETOTTER_LOG = gql`
  subscription($globeid: Int!) {
    globetotter_log(
      where: { globe_id: { _eq: $globeid } }
      order_by: { id: desc }
      limit: 1
    ) {
      id
    }
  }
`;

export default SUBSCRIBE_GLOBETOTTER_LOG;

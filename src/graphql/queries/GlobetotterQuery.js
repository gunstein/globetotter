import gql from "graphql-tag";

const QUERY_GLOBETOTTER_LOG = gql`
  query Globetotter_log($globeid: Int!, $last_transaction: Int!) {
    globetotter_log(
      where: { globe_id: { _eq: $globeid }, id: { _gt: $last_transaction } }
      order_by: { id: asc }
    ) {
      operation_id
      object_uuid
      object_data
      transaction_timestamp
      id
      globe_id
      transaction_uuid
    }
  }
`;

export default QUERY_GLOBETOTTER_LOG;

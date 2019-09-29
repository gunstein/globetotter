import gql from "graphql-tag";

const globetotterSubscription = gql`
  subscription($globeid: Int!) {
    globetotter_log(
      where: { globe_id: { _eq: $globeid } }
      order_by: { transaction_timestamp: desc }
      limit: 1
    ) {
      transaction_timestamp
    }
  }
`;

export default globetotterSubscription;

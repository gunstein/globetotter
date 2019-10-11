import { gql } from "apollo-boost";

const INSERT_GLOBETOTTER_LOG = gql`
  mutation insertGlobetotterLog(
    $globeId: Int!
    $data: jsonb!
    $objUuid: uuid!
    $operation: Int!
    $transUuid: uuid!
  ) {
    insert_globetotter_log(
      objects: {
        globe_id: $globeId
        object_data: $data
        object_uuid: $objUuid
        operation_id: $operation
        transaction_uuid: $transUuid
      }
    ) {
      affected_rows
    }
  }
`;

export default INSERT_GLOBETOTTER_LOG;

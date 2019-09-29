import { gql } from "apollo-boost";
import { useMutation } from "@apollo/react-hooks";

const INSERT_GLOBETOTTER_LOG = gql`
  mutation insertGlobetotterLog(
    $globeId: ID!
    $data: String!
    $objUuid: String!
    $operation: ID!
  ) {
    insert_globetotter_log(
      objects: {
        globe_id: $globeId
        object_data: $data
        object_uuid: $objUuid
        operation_id: $operation
      }
    ) {
      affected_rows
    }
  }
`;

const InsertGlobetotterLog = action => {
  let [insertGlobetotterLog] = useMutation(INSERT_GLOBETOTTER_LOG);
  insertGlobetotterLog({
    variables: {
      info_id: action.globeId,
      object_data: action.data,
      operation_id: action.actiontype,
      object_uuid: action.uuid
    }
  });
  return null;
};

export default InsertGlobetotterLog;

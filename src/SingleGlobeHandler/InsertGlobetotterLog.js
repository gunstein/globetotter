import { useEffect } from "react";
import { useMutation } from "@apollo/react-hooks";
import Schema from "validate";
import INSERT_GLOBETOTTER_LOG from "../graphql/mutations/InsertGlobetotterLog";

const InsertGlobetotterLog = ({ action }) => {
  let [insertGlobetotterLog] = useMutation(INSERT_GLOBETOTTER_LOG);

  useEffect(() => {
    console.log("InsertGlobetotterLog useEffect action: ", action);

    if (action === "") {
      return;
    }

    const actionobj = JSON.parse(action);

    //Check if action is ok
    const action_validator = new Schema({
      globe_id: {
        required: true,
        type: Number
      },
      object_data: {
        position: {
          x: {
            required: true
          },
          y: {
            required: true
          },
          z: {
            required: true
          }
        },
        color: {
          required: true,
          type: Number
        }
      },
      operation_id: {
        required: true,
        type: Number
      },
      object_uuid: {
        required: true
      },
      transaction_uuid: {
        required: true
      }
    });

    const errors = action_validator.validate(actionobj);

    console.log("actionobj.object_data", actionobj.object_data);
    console.log(
      "object_data stringify:",
      JSON.stringify(actionobj.object_data)
    );

    if (errors.length === 0) {
      insertGlobetotterLog({
        variables: {
          globeId: actionobj.globe_id,
          data: JSON.stringify(actionobj.object_data),
          operation: actionobj.operation_id,
          objUuid: actionobj.object_uuid,
          transUuid: actionobj.transaction_uuid
        }
      });
    } else {
      console.log("validation errors: ", errors);
    }
  }, [action]);

  return null;
};

export default InsertGlobetotterLog;

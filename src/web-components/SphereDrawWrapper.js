import React from "react";
import "./SphereDrawThreejs";

//https://www.robinwieruch.de/react-web-components
const SphereDrawWrapper = ({
  globeid,
  lastaction,
  timeHistory,
  currentColor,
  currentOperation,
  onSphereDrawAction,
  onHistoryLimitChange
}) => {
  const ref = React.useRef(null);
  React.useLayoutEffect(() => {
    const handleChange = customEvent => onSphereDrawAction(customEvent.detail);
    const handleHistoryLimitChange = customEvent =>
      onHistoryLimitChange(customEvent.detail);
    const { current } = ref;
    current.addEventListener("onSphereDrawAction", handleChange);
    current.addEventListener("onHistoryLimitChange", handleHistoryLimitChange);
    return () => {
      current.removeEventListener("onSphereDrawAction", handleChange);
      current.removeEventListener(
        "onHistoryLimitChange",
        handleHistoryLimitChange
      );
    };
  }, [ref]);

  React.useMemo(() => {
    if (lastaction !== "") {
      const { current } = ref;
      current.addGeometryActionToSphereSurfaceJSON(lastaction);
    }
  }, [lastaction]);

  React.useMemo(() => {
    const { current } = ref;
    if (current !== null) {
      current.current_history_time = timeHistory;
    }
  }, [timeHistory]);

  React.useMemo(() => {
    const { current } = ref;
    if (current !== null) {
      current.current_color = currentColor;
    }
  }, [currentColor]);

  React.useMemo(() => {
    const { current } = ref;
    if (current !== null) {
      current.current_operation = currentOperation;
    }
  }, [currentOperation]);

  return <spheredraw-threejs-element ref={ref} globeid={globeid} />;
};

export default SphereDrawWrapper;

import React from "react";
import "./SphereDrawThreejs";

//https://www.robinwieruch.de/react-web-components
const SphereDrawWrapper = ({
  globeid,
  lastaction,
  timeHistory,
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
    current.addGeometryActionToSphereSurfaceJSON(lastaction);
  }, [timeHistory]);

  return <spheredraw-threejs-element ref={ref} globeid={globeid} />;
};

export default SphereDrawWrapper;

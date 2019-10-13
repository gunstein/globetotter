import React from "react";
import "./SphereDrawThreejs";

const SphereDrawWrapper = ({ globeid, lastaction, onSphereDrawAction }) => {
  const ref = React.useRef(null);
  React.useLayoutEffect(() => {
    const handleChange = customEvent => onSphereDrawAction(customEvent.detail);
    const { current } = ref;
    current.addEventListener("onSphereDrawAction", handleChange);
    return () =>
      current.removeEventListener("onSphereDrawAction", handleChange);
  }, [ref]);

  React.useMemo(() => {
    if (lastaction !== "") {
      const { current } = ref;
      current.addGeometryActionToSphereSurfaceJSON(lastaction);
    }
  }, [lastaction]);

  return <spheredraw-threejs-element ref={ref} globeid={globeid} />;
};

export default SphereDrawWrapper;

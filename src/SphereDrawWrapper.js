import React from "react";
import "./web-components/SphereDrawThreejs";

const SphereDrawWrapper = ({ globeid, lastaction, onSphereDrawAction }) => {
  //const ref = React.createRef();
  console.log("SphereDrawWrapper lastAction: ", lastaction);
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
      console.log(
        "lastAction != null calling addGeometryActionToSphereSurfaceJSON "
      );
      const { current } = ref;
      current.addGeometryActionToSphereSurfaceJSON(lastaction);
    }
  }, [lastaction]);

  console.log("SphereDrawWrapper before return/render");
  return <spheredraw-threejs-element ref={ref} globeid={globeid} />;
};

export default SphereDrawWrapper;

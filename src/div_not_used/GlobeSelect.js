import React, { useState } from "react";
import QueryGlobetotterGlobe from "./QueryGlobetotterGlobe";

const GlobeSelect = () => {
  const [nameSearch, setNameSearch] = useState(0);

  //return <QueryGlobetotterGlobe name={nameSearch} />;

  return (
    <div>
      <input
        style={{ width: "100%", padding: "20px 10px" }}
        type="text"
        list="colors_data"
      />
      <datalist id="colors_data">
        <option value="red" />
        <option value="orange" />
        <option value="green" />
        <option value="blue">The color of the sky</option>
      </datalist>
    </div>
  );
  /*return <input style={{width:"100%"}}/>;*/
};

export default GlobeSelect;

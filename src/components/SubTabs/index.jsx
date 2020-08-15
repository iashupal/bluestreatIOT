import React from "react";
import "./styles.css";
import Highcharts from "highcharts/highstock";
import PieChart from "highcharts-react-official";

function SubTabs({ text, selected, onClick, styleName }) {
  return (
    <div
      onClick={onClick}
      className={`subtabContainer ${styleName} ${
        selected ? "activeSubTab" : ""
      }`}
    >
      {selected ? (
        <i className="far fa-folder-open" />
      ) : (
        <i className="fas fa-plus" />
      )}
      <p>{text}</p>
    </div>
  );
}
SubTabs.defaultProps = {
  selected: false,
};
export default SubTabs;

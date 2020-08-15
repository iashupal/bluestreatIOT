import React from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import "./styles.css";
import { useEffect } from "react";
import { useState } from "react";

function Graph(props) {
  const [percentage, setPercentage] = useState(0);
  const {
    children,
    graphStyle,
    onClick,
    trailColor,
    pathColor,
    strokeDashoffset,
    ...otherProps
  } = props;

  useEffect(() => {
    if (props.percentage > 95 && props.percentage != 100) {
      setPercentage(95);
    } else if (props.percentage <= 5 && props.percentage != 0) {
      setPercentage(5);
    } else {
      setPercentage(props.percentage);
    }
  });
  return (
    <div className={`progressBar_graph ${props.graphStyle}`}>
      <div>
        <CircularProgressbar
          value={percentage}
          styles={buildStyles({
            trailColor: props.trailColor,
            pathColor: props.pathColor,
            strokeDashoffset: props.strokeDashoffset,
          })}
          // trailColor={props.trailColor}
          // pathColor={props.pathColor}
          {...otherProps}
          className={`graphStroke ${props.mainStrokeStyle}`}
        />
      </div>
      <div className="progressbar_inr--info" onClick={props.onClick}>
        {props.children}
      </div>
    </div>
  );
}
export default Graph;

import React from "react";
import FullCard from "../FullCard";
import HalfCard from "../HalfCard";

function MainCard(props) {
  const wholeCard = props.wholeCard;
  if (wholeCard) {
    return (
      <HalfCard
        selectedTank={props.selectedTankId}
        selectedTypeGateway={props.selectedTypename}
      />
    );
  }
  return (
    <FullCard
      selectedTank={props.selectedTankId}
      selectedTypeGateway={props.selectedTypename}
    />
  );
}
export default MainCard;

import React, { Fragment, useState } from "react";
import Heading from "../Heading";
import ContentCard from "../ContentCard";
import Highcharts from "highcharts/highstock";
import PieChart from "highcharts-react-official";
import dropGreen from "../../assets/images/drop-green.png";
import dropYellow from "../../assets/images/drop-yellow.png";
import dropRed from "../../assets/images/drop-slashred.png";
import broadcastTowerRed from "../../assets/images/broadcast-tower-red.png";
import wifiRed from "../../assets/images/wifi-red.png";
import wifiGreen from "../../assets/images/wifi-green.png";
import broadcastGreen from "../../assets/images/broadcast-green.png";
// import OwlCarousel from 'react-owl-carousel';
import "owl.carousel/dist/assets/owl.carousel.css";
import "owl.carousel/dist/assets/owl.theme.default.css";
import "./fullcard.css";
import AnimatedTank from "../Chart/AnimatedTank";
import AnimatedGateway from "../Chart/AnimatedGateway";
import AnimatedInventory from "../Chart/AnimatedInventory";
import { easeQuadInOut } from "d3-ease";
import { gql } from "apollo-boost";
import { Query } from "react-apollo";
import { useQuery } from "@apollo/react-hooks";
import Loader from "../Loader";
import { set } from "lodash";
import { useEffect } from "react";
import CanvasJSReact from "../../canvasjs.react";

//var CanvasJSReact = require('./canvasjs.react');
var CanvasJS = CanvasJSReact.CanvasJS;
var CanvasJSChart = CanvasJSReact.CanvasJSChart;
const userId = localStorage.getItem("userId");
let totalGatewayGraphs = gql`
  query graphsgraphsData($id: Int) {
    locationEntry(id: $id) {
      tanksBelow10: tanks(
        recursive: true
        filter: {
          _or: [
            { levelPercent: { op: "<", v: 0.10 } }
            { levelPercent: { op: "isNull" } }
          ]
        }
      ) {
        totalCount
      }
      tanksBelow30: tanks(
        recursive: true
        filter: [
          { levelPercent: { op: "<", v: 0.30 } }
          { levelPercent: { op: ">=", v: 0.10 } }
        ]
      ) {
        totalCount
      }
      tanksAbove30: tanks(
        recursive: true
        filter: [{ levelPercent: { op: ">=", v: 0.30 } }]
      ) {
        totalCount
      }
      totalTanks: tanks(recursive: true) {
        totalCount
      }
      offlineTanks: tanks(
        recursive: true
        filter: [{ alarmingTypes: { op: "in", v: "sensorMissedReportsAlarm" } }]
      ) {
        totalCount
      }

      bulk: tanks(recursive: true, filter: [{ isBulk: { op: "=", v: true } }]) {
        totalCount
        aggregate {
          sum_capacityGallons
          sum_levelGallons
          avg_levelPercent
        }
      }
      client: tanks(
        recursive: true
        filter: [{ isBulk: { op: "=", v: false } }]
      ) {
        totalCount
        aggregate {
          sum_capacityGallons
          sum_levelGallons
          avg_levelPercent
        }
      }
    }
  }
`;

let totalGraphs = gql`
  query graphsgraphsData($id: Int) {
    locationEntry(id: $id) {
      tanksBelow10: tanks(
        recursive: true
        filter: {
          _or: [
            { levelPercent: { op: "<", v: 0.10 } }
            { levelPercent: { op: "isNull" } }
          ]
        }
      ) {
        totalCount
      }
      tanksBelow30: tanks(
        recursive: true
        filter: [
          { levelPercent: { op: "<", v: 0.30 } }
          { levelPercent: { op: ">=", v: 0.10 } }
        ]
      ) {
        totalCount
      }
      tanksAbove30: tanks(
        recursive: true
        filter: [{ levelPercent: { op: ">=", v: 0.30 } }]
      ) {
        totalCount
      }
      totalTanks: tanks(recursive: true) {
        totalCount
      }
      offlineTanks: tanks(
        recursive: true
        filter: [{ alarmingTypes: { op: "in", v: "sensorMissedReportsAlarm" } }]
      ) {
        totalCount
      }
      ... on Location {
        totalGateways: sublocations(
          recursive: true
          filter: [{ isGateway: { op: "=", v: true } }]
        ) {
          totalCount
        }
        offlineGateways: sublocations(
          recursive: true
          filter: [
            { alarmingTypes: { op: "in", v: "gatewayMissedCheckinsAlarm" } }
            { isGateway: { op: "=", v: true } }
          ]
        ) {
          totalCount
        }
      }
      bulk: tanks(recursive: true, filter: [{ isBulk: { op: "=", v: true } }]) {
        totalCount
        aggregate {
          sum_capacityGallons
          sum_levelGallons
          avg_levelPercent
        }
      }
      client: tanks(
        recursive: true
        filter: [{ isBulk: { op: "=", v: false } }]
      ) {
        totalCount
        aggregate {
          sum_capacityGallons
          sum_levelGallons
          avg_levelPercent
        }
      }
    }
  }
`;
function FullCard({ selectedTank, selectedTypeGateway, parentCallBack }) {
  const tankId = selectedTank;
  let finalGraph;
  const selectedGateway = selectedTypeGateway;
  // console.log("selectedGateway", selectedGateway);
  if (selectedGateway == "GatewayLocation") {
    finalGraph = totalGatewayGraphs;
  } else {
    finalGraph = totalGraphs;
  }

  const {
    loading: loadingGraphs,
    error: errorGraphs,
    data: graphsData,
  } = useQuery(finalGraph, {
    variables: { id: tankId },
  });

  if (loadingGraphs || !graphsData)
    return (
      <div>
        <Loader />
      </div>
    );

  // console.log("tank", graphsData.locationEntry);
  // console.log("offlineGateway", graphsData.locationEntry.offlineGateways);
  if (errorGraphs) return console.log("Failed to fetch");

  //const options = {
  //  animationEnabled: true,
  //  title: {
  //    // text: "Customer Satisfaction"
  //  },
  //  // subtitles: [
  //  //   {
  //  //     //text: "71% Positive",

  //  //     fontSize: 24,
  //  //   },
  //  // ],
  //  title: {
  //    fontSize: 30,
  //  },
  //  height: 200,
  //  data: [
  //    {
  //      type: "pie",
  //      indexLabel: "{name}: {count}",
  //      yValueFormatString: "#,###'%'",
  //      dataPoints: [
  //        {
  //          name: "below 30%",
  //              color: "#ff6d00",
  //              count: graphsData
  //                  ? graphsData.locationEntry
  //                      ? graphsData.locationEntry.tanksBelow30.totalCount
  //                      :""
  //                  : "0",
  //          y: graphsData
  //            ? graphsData.locationEntry
  //              ? (graphsData.locationEntry.tanksBelow30.totalCount * 100) /
  //                graphsData.locationEntry.totalTanks.totalCount
  //              : ""
  //            : "0",
  //        },

  //        {
  //          name: "below 10%",

  //            color: "#e02020",
  //            count: graphsData
  //                ? graphsData.locationEntry
  //                    ? graphsData.locationEntry.tanksBelow10.totalCount
  //                    : ""
  //                : "0",
  //          y: graphsData
  //            ? graphsData.locationEntry
  //              ? (graphsData.locationEntry.tanksBelow10.totalCount * 100) /
  //                graphsData.locationEntry.totalTanks.totalCount
  //              : ""
  //            : "0",
  //        },

  //        {
  //          name: "above 30%",
  //            color: "#90c822",
  //            count: graphsData
  //                ? graphsData.locationEntry
  //                    ? graphsData.locationEntry.tanksAbove30.totalCount
  //                    : ""
  //                : "0",
  //          y: graphsData
  //            ? graphsData.locationEntry
  //              ? (graphsData.locationEntry.tanksAbove30.totalCount * 100) /
  //                graphsData.locationEntry.totalTanks.totalCount
  //              : "0"
  //            : "0",
  //        },
  //      ],
  //    },
  //  ],
  //};

  //var chart = $('#container').highcharts();
  //var seriesLength = chart.series.length;
  //for (var i = seriesLength - 1; i > -1; i--) {
  //    //chart.series[i].remove();
  //    if (chart.series[i].name == document.getElementById("series_name").value)
  //        chart.series[i].remove();
  //}
  const options = {
    title: {
      text: "",
    },
    chart: {
      type: "pie",
      // renderTo: "tank_pieChart",
      // margin: [0, 0, 0, 0],
      // spacingTop: 0,
      // spacingBottom: 0,
      // spacingLeft: 0,
      // spacingRight: 0,
      // showInLegend: false,
    },
    legend: {
      enabled: false,
    },

    chartOptions: { height: 200 },
    series: [
      {
        // tooltip: {
        //   pointFormat: "",
        //   fontSize: "60px",
        // },
        tooltip: {
          pointFormat: "",
          style: {
            color: "blue",
            fontWeight: "bold",
          },
        },
        plotOptions: {
          pie: {
            size: 200,
            height: "100%",
          },
          hover: {
            pie: {
              size: 200,
            },
          },
        },
        dataLabels: {
          enabled: false,
        },
        cursor: "pointer",
        data: [
          {
            //name: "",

            events: {
              click: function () {
                parentCallBack("Below 30%");
              },
            },

            color: "#f7b500",
            key: "Below 30%",
            name: graphsData
              ? graphsData.locationEntry
                ? graphsData.locationEntry.tanksBelow30.totalCount
                : ""
              : "0",
            y: graphsData
              ? graphsData.locationEntry
                ? graphsData.locationEntry.tanksBelow30.totalCount
                : ""
              : "0",
          },
          {
            // name: "",
            events: {
              click: function () {
                parentCallBack("Below 10%");
              },
            },
            color: "#e02020",
            key: "Below 10%",
            name: graphsData
              ? graphsData.locationEntry
                ? graphsData.locationEntry.tanksBelow10.totalCount
                : ""
              : "0",
            y: graphsData
              ? graphsData.locationEntry
                ? graphsData.locationEntry.tanksBelow10.totalCount
                : ""
              : "0",
          },
          {
            // name: "",
            events: {
              click: function () {
                parentCallBack("Above 30%");
              },
            },
            color: "#90c822",
            key: "Above 30%",
            name: graphsData
              ? graphsData.locationEntry
                ? graphsData.locationEntry.tanksAbove30.totalCount
                : ""
              : "0",
            y: graphsData
              ? graphsData.locationEntry
                ? graphsData.locationEntry.tanksAbove30.totalCount
                : "0"
              : "0",
          },
        ],
      },
    ],
  };
  const optionsForZero = {
    title: {
      text: "",
    },
    chart: {
      type: "pie",

      showInLegend: false,
    },
    legend: {
      enabled: false,
    },
    chartOptions: { height: 200 },
    series: [
      {
        // tooltip: {
        //   pointFormat: "",
        //   fontSize: "60px",
        // },
        tooltip: {
          pointFormat: "",
          style: {
            color: "blue",
            fontWeight: "bold",
          },
        },
        plotOptions: {
          pie: {
            size: 200,
            height: "100%",
          },
          hover: {
            pie: {
              size: 200,
            },
          },
          click: {
            pie: {
              size: 200,
            },
          },
        },
        dataLabels: {
          enabled: false,
        },

        data: [
          {
            // name: "",
            color: "#bebebe",
            name: "No  data",
            y: 2,
          },
          {
            // name: "",
            color: "#90c822",
            name: "No  data",
            y: 0,
          },
        ],
      },
    ],
  };

  return (
    <div>
      <Fragment>
        <div
          className="card_container"
          //  margin={20}
          //  nav
          //  items={3}
          // autoplay ={true}
        >
          <ContentCard
            styleName="card_tank"
            contents={[
              <div className="full--card_content">
                <Heading
                  fontSize="20"
                  clientName="Client"
                  heading="Tanks"
                  count={
                    graphsData.locationEntry
                      ? graphsData.locationEntry.totalTanks.totalCount
                      : "0"
                  }
                />
                <div className="Progress_wrapper">
                  <div className="tank_pieChart">
                    {graphsData.locationEntry.totalTanks.totalCount != 0 && (
                      <PieChart
                        highcharts={Highcharts}
                        options={options}
                        // style="height: 600px;"
                      />
                    )}
                    ,
                    {graphsData.locationEntry.totalTanks.totalCount == 0 && (
                      <PieChart
                        highcharts={Highcharts}
                        options={optionsForZero}
                        // style="height: 600px;"
                      />
                    )}
                  </div>
                  <div className="client_tank--count">
                    <ul>
                      {
                        <li>
                          {/* <span className="dot"></span> */}
                          <img
                            className="tanks__count--drop"
                            src={dropGreen}
                            alt="tank_drop"
                          />
                          <a
                            onClick={() => {
                              parentCallBack("Above 30%");
                            }}
                          >
                            {" "}
                            Above 30% -{" "}
                            {graphsData
                              ? graphsData.locationEntry
                                ? graphsData.locationEntry.tanksAbove30
                                    .totalCount
                                : ""
                              : "0"}
                          </a>
                        </li>
                      }

                      {
                        <li>
                          {/* <span className="dot"></span> */}
                          <img
                            className="tanks__count--drop"
                            src={dropYellow}
                            alt="tank_drop"
                          />
                          <a
                            onClick={() => {
                              parentCallBack("Below 30%");
                            }}
                          >
                            {" "}
                            Below 30% -{" "}
                            {graphsData
                              ? graphsData.locationEntry
                                ? graphsData.locationEntry.tanksBelow30
                                    .totalCount
                                : ""
                              : "0"}
                          </a>
                        </li>
                      }
                      {
                        <li>
                          {/* <span className="dot"></span> */}
                          <img
                            className="tanks__count--drop"
                            src={dropRed}
                            alt="tank_drop"
                          />
                          <a
                            onClick={() => {
                              parentCallBack("Below 10%");
                            }}
                          >
                            {" "}
                            Below 10% -{" "}
                            {graphsData
                              ? graphsData.locationEntry
                                ? graphsData.locationEntry.tanksBelow10
                                    .totalCount
                                : ""
                              : "0"}
                          </a>
                        </li>
                      }
                    </ul>
                  </div>
                </div>
              </div>,
            ]}
          />
          <ContentCard
            styleName="card_gateway"
            contents={[
              <div className="full--card_content">
                <Heading clientName="Client" heading="Gateways & Sensors" />
                <div className="card_division">
                  <div className="card_inr--divisn">
                    <div>
                      <img
                        src={require("../../assets/images/broadcast-blue.png")}
                        alt="broadcast_message"
                      />
                      <p>Gateways</p>
                    </div>
                    <AnimatedGateway
                      percentage={
                        graphsData
                          ? graphsData.locationEntry
                            ? graphsData.locationEntry.totalGateways
                              ? Math.round(
                                  (graphsData.locationEntry.offlineGateways
                                    .totalCount *
                                    100) /
                                    graphsData.locationEntry.totalGateways
                                      .totalCount
                                )
                              : 0
                            : 0
                          : 0
                      }
                      count={
                        graphsData
                          ? graphsData.locationEntry
                            ? graphsData.locationEntry.offlineGateways
                              ? graphsData.locationEntry.offlineGateways
                                  .totalCount
                              : 0
                            : 0
                          : 0
                      }
                      trailColor={
                        graphsData
                          ? graphsData.locationEntry
                            ? graphsData.locationEntry.offlineGateways
                              ? graphsData.locationEntry.offlineGateways
                                  .totalCount != null
                                ? graphsData.locationEntry.totalGateways
                                    .totalCount
                                  ? "var(--color-parrot)"
                                  : "var(--color-lightgrey)"
                                : "var(--color-lightgrey)"
                              : "var(--color-lightgrey)"
                            : "var(--color-lightgrey)"
                          : "var(--color-lightgrey)"
                      }
                      pathColor={
                        graphsData
                          ? graphsData.locationEntry
                            ? graphsData.locationEntry.offlineGateways
                              ? graphsData.locationEntry.offlineGateways
                                  .totalCount != null
                                ? Math.round(
                                    (graphsData.locationEntry.offlineGateways
                                      .totalCount *
                                      100) /
                                      graphsData.locationEntry.totalGateways
                                        .totalCount
                                  )
                                  ? "var(--color-red)"
                                  : "var(--color-lightgrey)"
                                : "var(--color-lightgrey)"
                              : "var(--color-lightgrey)"
                            : "var(--color-lightgrey)"
                          : "var(--color-lightgrey)"
                      }
                      strokeColor="gatewayStroke"
                      duration={1.4}
                      easingFunction={easeQuadInOut}
                      image={broadcastTowerRed}
                      image1={broadcastGreen}
                      percntgStatus="OFFLINE"
                      percntgStatus1="ONLINE"
                      onlineGateway={
                        graphsData.locationEntry
                          ? graphsData.locationEntry.totalGateways
                            ? graphsData.locationEntry.totalGateways
                                .totalCount -
                              graphsData.locationEntry.offlineGateways
                                .totalCount
                            : 0
                          : 0
                      }
                    />
                  </div>
                  <div className="card_inr--divisn">
                    <div>
                      <i className="fa fa-wifi" />
                      <p>Sensors</p>
                    </div>

                    <AnimatedGateway
                      percentage={
                        graphsData
                          ? graphsData.locationEntry
                            ? graphsData.locationEntry.offlineTanks
                              ? Math.round(
                                  (graphsData.locationEntry.offlineTanks
                                    .totalCount *
                                    100) /
                                    graphsData.locationEntry.totalTanks
                                      .totalCount
                                )
                              : 0
                            : 0
                          : 0
                      }
                      count={
                        graphsData
                          ? graphsData.locationEntry
                            ? graphsData.locationEntry.offlineTanks
                              ? graphsData.locationEntry.offlineTanks.totalCount
                              : 0
                            : "0"
                          : "0"
                      }
                      pathColor={
                        graphsData
                          ? graphsData.locationEntry
                            ? graphsData.locationEntry.offlineTanks
                              ? graphsData.locationEntry.offlineTanks
                                  .totalCount != null
                                ? Math.round(
                                    (graphsData.locationEntry.offlineTanks
                                      .totalCount *
                                      100) /
                                      graphsData.locationEntry.totalTanks
                                        .totalCount
                                  )
                                  ? "var(--color-red)"
                                  : "var(--color-lightgrey"
                                : "var(--color-lightgrey)"
                              : "var(--color-lightgrey)"
                            : "var(--color-lightgrey)"
                          : "var(--color-lightgrey)"
                      }
                      trailColor={
                        graphsData
                          ? graphsData.locationEntry
                            ? graphsData.locationEntry.offlineTanks
                              ? graphsData.locationEntry.totalTanks
                                  .totalCount != null
                                ? graphsData.locationEntry.totalTanks.totalCount
                                  ? "var(--color-parrot)"
                                  : "var(--color-lightgrey)"
                                : "var(--color-lightgrey)"
                              : "var(--color-lightgrey)"
                            : "var(--color-lightgrey)"
                          : "var(--color-lightgrey)"
                      }
                      strokeColor="sensorStroke"
                      duration={1.4}
                      easingFunction={easeQuadInOut}
                      image={wifiRed}
                      image1={wifiGreen}
                      percntgStatus="OFFLINE"
                      percntgStatus1="ONLINE"
                      onlineGateway={
                        graphsData
                          ? graphsData.locationEntry.totalTanks
                            ? graphsData.locationEntry.totalTanks.totalCount -
                              graphsData.locationEntry.offlineTanks.totalCount
                            : "0"
                          : "0"
                      }
                    />
                  </div>
                </div>
              </div>,
            ]}
          />
          <ContentCard
            styleName="card_inventory"
            contents={[
              <div className="full--card_content">
                <Heading clientName="Client" heading="Total Inventory" />
                <div className="card_division">
                  <div className="card_inr--divisn">
                    <p>
                      Bulk Inventory <strong>Available</strong>
                    </p>
                    <AnimatedInventory
                      percentage={
                        graphsData.locationEntry != null
                          ? graphsData.locationEntry.bulk.aggregate
                              .sum_levelGallons === 0
                            ? 0
                            : (graphsData.locationEntry.bulk.aggregate
                                .sum_levelGallons /
                                graphsData.locationEntry.bulk.aggregate
                                  .sum_capacityGallons) *
                              100
                          : 0
                      }
                      duration={1.4}
                      strokeColor="bulkStroke"
                      count={
                        graphsData.locationEntry
                          ? Math.round(
                              graphsData.locationEntry.bulk.aggregate
                                .sum_capacityGallons
                            ).toLocaleString()
                          : "0"
                      }
                      easingFunction={easeQuadInOut}
                      percntgStatus="AVAILABLE"
                      percntgStatus1="GALLONS"
                    />
                  </div>
                  <div className="card_inr--divisn">
                    <p>
                      Customer Tanks <strong>Potential</strong>
                    </p>
                    <AnimatedInventory
                      percentage={
                        graphsData.locationEntry != null
                          ? graphsData.locationEntry.client.aggregate
                              .sum_levelGallons === 0
                            ? 0
                            : (graphsData.locationEntry.client.aggregate
                                .sum_levelGallons /
                                graphsData.locationEntry.client.aggregate
                                  .sum_capacityGallons) *
                              100
                          : 0
                      }
                      strokeColor="clientStroke"
                      count={
                        graphsData.locationEntry
                          ? Math.round(
                              graphsData.locationEntry.client.aggregate
                                .sum_capacityGallons
                            ).toLocaleString()
                          : "0"
                      }
                      duration={1.4}
                      easingFunction={easeQuadInOut}
                      percntgStatus="POTENTIAL"
                      percntgStatus1="GALLONS"
                    />
                  </div>
                </div>
              </div>,
            ]}
          />
        </div>
      </Fragment>
    </div>
  );
}

export default FullCard;

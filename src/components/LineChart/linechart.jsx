import React, { Fragment, useEffect } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { gql } from "apollo-boost";
import { useQuery } from "@apollo/react-hooks";
import Loader from "../Loader";
import { useState } from "react";

const lineGraph = gql`
  query lineGraphData($id: Int, $fromdate: String, $todate: String) {
    tank(id: $id) {
      id
      specifications {
        capacity
        capacityUnits
        capacityGallons
      }
      readings(
        first: 100
        filter: [
          { timestamp: { op: ">=", v: $fromdate } }
          { timestamp: { op: "<=", v: $todate } }
        ]
      ) {
        totalCount
        edges {
          node {
            timestamp
            levelPercent
          }
        }
      }
    }
  }
`;
// const options = {
//   chart: {
//     type: "area",
//     // zoomType: "x",
//   },
//   title: {
//     text: "Client Tank Capacity (%)",
//   },
//   xAxis: {
//     // categories: xAxisData,
//     type: "datetime",
//     // maxZoom: 48 * 3600 * 1000,
//     // tickInterval: 24 * 3600 * 1000,
//     tickInterval: 24 * 3600 * 1000 * 5,
//     tickPositioner: function (min, max) {
//       var interval = this.options.tickInterval,
//         ticks = [],
//         count = 0;

//       while (min < max) {
//         ticks.push(min);
//         min += interval;
//         count++;
//       }

//       ticks.info = {
//         unitName: "day",
//         count: 5,
//         higherRanks: {},
//         totalRange: interval * count,
//       };

//       return ticks;
//     },
//     tickmarkPlacement: "on",
//     title: {
//       enabled: false,
//     },
//   },
//   yAxis: {
//     labels: {
//       format: "{value}%",
//     },
//     title: {
//       enabled: false,
//     },
//   },

//   plotOptions: {
//     area: {
//       fillColor: {
//         linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
//         stops: [
//           [0, Highcharts.getOptions().colors[0]],
//           [
//             1,
//             Highcharts.Color(Highcharts.getOptions().colors[0])
//               .setOpacity(0)
//               .get("rgba"),
//           ],
//         ],
//       },
//       marker: {
//         radius: 2,
//       },
//       lineWidth: 1,
//       states: {
//         hover: {
//           lineWidth: 1,
//         },
//       },
//       threshold: null,
//     },
//   },
//   series: [
//     {
//       name: "Level",

//       // data: [100, 50, 300, 30, 50, 100],
//       data: yAxisData,
//       pointStart: Date
//         .UTC
//         // todaysDate.getUTCFullYear(),
//         // todaysDate.getUTCMonth(),
//         // todaysDate.getUTCDate()
//         (),
//       pointInterval: 24 * 3600 * 1000, // seven days
//     },
//   ],
// };

function LineChart(props) {
  var today = new Date();
  const [xAxisData] = useState([]);
  const [yAxisData] = useState([]);
  const { selectedTankId } = useState("");
  const { lineGraphData, setLineGraphData } = useState("");
  const [chartOptions, setChartOptions] = useState({
    chart: {
      type: "area",
      // zoomType: "x",
    },
    title: {
      text: "Client Tank Capacity (%)",
    },
    xAxis: {
      // categories: xAxisData,
      type: "datetime",
      // maxZoom: 48 * 3600 * 1000,
      // tickInterval: 24 * 3600 * 1000,
      tickInterval: 24 * 3600 * 1000 * 5,
      tickPositioner: function (min, max) {
        var interval = this.options.tickInterval,
          ticks = [],
          count = 0;

        while (min < max) {
          ticks.push(min);
          min += interval;
          count++;
        }

        ticks.info = {
          unitName: "day",
          count: 5,
          higherRanks: {},
          totalRange: interval * count,
        };

        return ticks;
      },
      tickmarkPlacement: "on",
      title: {
        enabled: false,
      },
    },
    yAxis: {
      labels: {
        format: "{value}%",
      },
      title: {
        enabled: false,
      },
    },

    plotOptions: {
      area: {
        fillColor: {
          linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
          stops: [
            [0, Highcharts.getOptions().colors[0]],
            [
              1,
              Highcharts.Color(Highcharts.getOptions().colors[0])
                .setOpacity(0)
                .get("rgba"),
            ],
          ],
        },
        marker: {
          radius: 2,
        },
        lineWidth: 1,
        states: {
          hover: {
            lineWidth: 1,
          },
        },
        threshold: null,
      },
    },
    series: [
      {
        name: "Level",

        // data: [100, 50, 300, 30, 50, 100],
        data: yAxisData,
        pointStart: Date
          .UTC
          // todaysDate.getUTCFullYear(),
          // todaysDate.getUTCMonth(),
          // todaysDate.getUTCDate()
          (),
        pointInterval: 24 * 3600 * 1000, // seven days
      },
    ],
  });
  // var today = new Date("2020-05-18T19:36:49.000Z");
  // var todaysDate = new Date("2020-05-18T19:36:49.000Z");
  // var last30days = new Date(today.setDate(today.getDate() - 30));
  // var firstday = new Date(today.getFullYear(), 0, 1); // XXXX/01/01
  // var diff = Math.ceil((today - firstday) / 86400000);
  // var quarter = parseInt(diff / (365 / 4)) + 1;
  // console.log("quarter", quarter);
  // console.log("today", today.toUTCString());
  // console.log("Today: ", todaysDate.toUTCString());
  // console.log("Last 30th day: " + last30days.toUTCString());
  const { loading, error, data } = useQuery(lineGraph, {
    variables: {
      id: props.selectedTankId,
      // fromdate: todaysDate,
      // todate: last30days,
    },
  });
  if (loading || !data)
    return (
      <p>
        <Loader />
      </p>
    );
  else if (error) return console.log("Failed to fetch");
  else if (data) {
    if (
      !Object.keys(lineGraphData).length ||
      String(this.state.selectedTankId) !== String(this.props.selectedTankId)
    )
      setLineGraphData({
        lineGraphData: { ...data.tank.readings.edges },
        selectedTankId: this.props.selectedTankId,
      });
    // this.setState({
    //   lineGraphData: { ...data.tank.readings.edges },
    //   selectedTankId: this.props.selectedTankId,
    // });
  }

  useEffect(function () {
    if (data.tank.readings.edges.length > 0) {
      data.tank.readings.edges.map((item) => {
        xAxisData.push(item.node.timestamp);
        yAxisData.push(item.node.levelPercent);
      });
    }
    return () => {
      console.log("hi");
    };
  }, []);
  const onFilterDataChangeGraph = (passFilteredData) => {
    console.log("pass filter data", passFilteredData);
  };
  console.log("lineGraphData", lineGraphData);
  console.log("filtered date basis data", props.passFilteredData);
  console.log("xAxisData", xAxisData);
  console.log("yAxisData", yAxisData);
  console.log("selectedtankid", props.selectedTankId);
  console.log("linegraph", data);

  return (
    <Fragment>
      <HighchartsReact
        highcharts={Highcharts}
        options={chartOptions}
        onChange={onFilterDataChangeGraph}
      />
    </Fragment>
  );
}
export default LineChart;

import React, { Fragment, useEffect } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { gql } from "apollo-boost";
import { useQuery } from "@apollo/react-hooks";
import Loader from "../Loader";

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
var xAxisData = [];
var yAxisData = [];
var today = new Date("2020-05-18T19:36:49.000Z");
var todaysDate = new Date("2020-05-18T19:36:49.000Z");
var last30days = new Date(today.setDate(today.getDate() - 30));
const options = {
  chart: {
    type: "area",
    // zoomType: "x",
  },
  title: {
    text: "Client Tank Capacity (%)",
  },
  // subtitle: {
  //   text: "Source: Wikipedia.org",
  // },
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
  // tooltip: {
  //   pointFormat:
  //     '<span style="color:{series.color}">{series.name}</span>: <b>{point.percentage:.1f}</b> ({point.y:,.0f} %)<br/>',
  //   // `<span style="color:{series.color}">{series.name}</span>: <b>{point.percentage:.1f}</b> ({point.y:,.0f} %)<br/>`,
  //   split: true,
  // },

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
      pointStart: Date.UTC(
        todaysDate.getUTCFullYear(),
        todaysDate.getUTCMonth(),
        todaysDate.getUTCDate()
      ),
      pointInterval: 24 * 3600 * 1000, // seven days
    },
  ],
};
function LineChart(props) {
  // console.log(date);
  var today = new Date();
  // var dateLimit = new Date(new Date().setDate(today.getDate()));
  console.log("timestamp", props.timestamp);
  console.log("today", today.toUTCString());
  console.log("Today: ", todaysDate.toUTCString());
  console.log("Last 30th day: " + last30days.toUTCString());
  console.log("tank table history data", props.filtercondition);
  const { loading, error, data } = useQuery(lineGraph, {
    variables: {
      id: props.selectedTankId,
      fromdate: last30days,
      todate: todaysDate,
    },
  });
  if (loading || !data)
    return (
      <p>
        <Loader />
      </p>
    );

  if (data.tank.readings.edges.length > 0) {
    data.tank.readings.edges.map((item) => {
      xAxisData.push(item.node.timestamp);
      yAxisData.push(item.node.levelPercent);
    });
  }
  console.log("xAxisData", xAxisData);
  console.log("yAxisData", yAxisData);
  console.log("selectedtankid", props.selectedTankId);
  console.log("linegraph", data);
  if (error) return console.log("Failed to fetch");

  return (
    <Fragment>
      <HighchartsReact highcharts={Highcharts} options={options} />
    </Fragment>
  );
}
export default LineChart;

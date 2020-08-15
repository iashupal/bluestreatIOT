import React, { Fragment, useEffect, useState } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { gql } from "apollo-boost";
import { useQuery, useLazyQuery } from "@apollo/react-hooks";
import Loader from "../Loader";
import moment from "moment";
import "./style.css";

const lineGraph = gql`
  query lineGraphData(
    $id: Int
    $first: Int
    $fromdate: String
    $todate: String
  ) {
    tank(id: $id) {
      id
      specifications {
        capacity
        capacityUnits
        capacityGallons
      }
      readings(
        first: $first
        sortDirection: desc
        sortBy: timestamp
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

const today = new Date();
const todaysDate = new Date();
const last30days = new Date(today.setDate(today.getDate() - 30));
var daysInMonth = [];

var monthDate = moment().startOf(todaysDate);

_.times(monthDate.daysInMonth(), function (n) {
  daysInMonth.push(monthDate.format("YYYY-MM-DD"));
  monthDate.subtract(1, "day");
});

function LineChart(props) {
  const [xAxisData, setXAxisData] = useState(daysInMonth.slice(0, -1));
  const [yAxisData, setYAxisData] = useState([]);
  const [message, setMessage] = useState("");

  //var fetchedTankData = props.fetchedTankData;
  console.log("anjali", props.fetchedTankData);
  const [options, setOptions] = useState({
    chart: {
      type: "area",
      spacingRight: 50,
    },
    title: {
      text: "Client tank capacity (%- Last read of the day)",
    },
    subtitle: {
      text: message,
      style: {
        fontSize: "24px",
      },
    },
    xAxis: [
      {
        categories: xAxisData,
        // tickInterval: 7 * 24 * 3600 * 1000,
        type: "datetime",
        title: {
          enabled: false,
        },
      },
    ],
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
          linearGradient: {
            x1: 0,
            y1: 0,
            x2: 0,
            y2: 1,
          },
          stops: [
            [0, Highcharts.getOptions().colors[0]],
            [
              1,
              Highcharts.color(Highcharts.getOptions().colors[0])
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
      },
    },
    tooltip: {
      pointFormat:
        "<tr><td>{series.name}: </td>" +
        '<td style="text-align: right"><b>{point.y} %</b></td></tr>',
    },
    series: [
      {
        name: "Level",
        data: yAxisData,
      },
    ],
  });
  const [fetchedData, setFetchedData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [edges, setEdges] = useState([]);
  console.log("Helllllo", props.dateDiff);
  const [currentDate, setCurrentDate] = useState(
      props.dateDiff <= 3 ? moment(props.endDate).add(1, 'd') : moment(props.endDate).add(1, 'd')
  );
  const [previousDate, setPreviousDate] = useState(
    props.dateDiff <= 3
      ? props.startDate
      : moment(props.endDate).subtract(3, "months").format("YYYY-MM-DD")
  );

  useEffect(() => {
    console.log("Helllllo", props.dateDiff);
    //setFetchedData(props.TankData)
    //console.log("fetchedData", fetchedData)
      setCurrentDate(props.dateDiff <= 3 ? moment(props.endDate).add(1, 'd') : moment(props.endDate).add(1, 'd'));
    setPreviousDate(
      props.dateDiff <= 3
        ? props.startDate
        : moment(props.endDate).subtract(3, "months").format("YYYY-MM-DD")
    );
  }, [JSON.stringify(props.endDate)]);
  console.log(props.endDate);
  const [getData, { error, data }] = useLazyQuery(lineGraph);

  useEffect(() => {
    console.log("I am here too ----->", previousDate);
    getData({
      variables: {
        id: props.selectedTankId,
        first: 1000,
        fromdate: previousDate,
        todate: currentDate,
      },
    });
  }, [currentDate, previousDate]);

  useEffect(() => {
    console.log("I am here ----->", data);
    if (!data && !loading) {
      setLoading(true);
    } else {
      setLoading(false);
    }
    if (data && data.tank.readings.edges.length > 0) {
      setLoading(false);
      var xData = [];
      var yData = [];
      const xFilterData = [];
      var resultValue = [];
      var Xresult = 0;
      var dateValue = "";
      console.log("Previous Value", data.tank.readings.edges);
      resultValue = data.tank.readings.edges;
        for (let i = 0; i <= resultValue.length - 1; i++) {
        //if (
        //  i == 0 &&
        //  !xFilterData.includes(
        //    moment(resultValue[i].node.timestamp).format("YYYY-MM-DD")
        //  )
        //) {
        //  xData.push(
        //    moment(resultValue[i].node.timestamp).format("YYYY-MM-DD")
        //  );
        //}
        if (
          !xFilterData.includes(
            moment(resultValue[i].node.timestamp).format("YYYY-MM-DD")
          )
        ) {
          console.log("After removing the duplicate element", xFilterData);
          if (Xresult % 7 == 0) {
            xData.push(
              moment(resultValue[i].node.timestamp).format("YYYY-MM-DD")
            );
          } else {
            xData.push("");
          }
          yData.push(Math.round(resultValue[i].node.levelPercent * 100));
          xFilterData.push(
            moment(resultValue[i].node.timestamp).format("YYYY-MM-DD")
          );
          Xresult = Xresult + 1;
        }
        //  xData.push(moment(item.node.timestamp).format("YYYY-MM-DD"));
      }
      //  data.tank.readings.edges.map((item) => {
      //      resultValue = item;
      //      if (dateValue == resultValue.moment(item.node.timestamp).format("YYYY-MM-DD")) {
      //          dateValue = resultValue.moment(item.node.timestamp).format("YYYY-MM-DD");
      //      }
      //      else {
      //          if (
      //              !xFilterData.includes(
      //                  moment(item.node.timestamp).format("YYYY-MM-DD")
      //              )
      //          ) {
      //              console.log("After removing the duplicate element", xFilterData);
      //              if (Xresult % 7 == 0) {
      //                  xData.push(moment(item.node.timestamp).format("YYYY-MM-DD"));
      //              }
      //              else {
      //                  xData.push("");
      //              }
      //              yData.push(item.node.levelPercent * 100);
      //              xFilterData.push(moment(item.node.timestamp).format("YYYY-MM-DD"));
      //              Xresult = Xresult + 1;
      //          }
      //      }

      //   xData.push(moment(item.node.timestamp).format("YYYY-MM-DD"));
      //});
      console.log("Heellllo", xData);
      //xData = xData.reverse();
      //yData = yData.reverse();
      setXAxisData([...xData]);
      setYAxisData([...yData]);
      const updatedOptions = { ...options };
      updatedOptions.subtitle.text = "";
      updatedOptions.xAxis[0].categories = xData;
      updatedOptions.series[0].data = yData;
      console.log("updatedOption", updatedOptions);
      setOptions({ ...updatedOptions });
    } else if (data && data.tank.readings.edges.length == 0) {
      const xData = [];
      const yData = [];
      setXAxisData([...xData]);
      setYAxisData([...yData]);
      setMessage("Client Tank Capacity(%)");
      const updatedOptions = { ...options };
      updatedOptions.subtitle.text = "No Data Found";
      updatedOptions.xAxis[0].categories = xData;
      updatedOptions.series[0].data = yData;
      console.log("updatedOption", updatedOptions);
      setOptions({ ...updatedOptions });
    }
  }, [data]);

  if (error) return console.log("Failed to fetch");
  if (loading) {
    return <Loader />;
  } else {
    return (
      <Fragment>
        <div className="line-chart">
          <HighchartsReact highcharts={Highcharts} options={options} />
        </div>
      </Fragment>
    );
  }
}

export default LineChart;

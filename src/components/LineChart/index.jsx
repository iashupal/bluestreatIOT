import React, { Fragment } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { gql } from "apollo-boost";
import { Query } from "react-apollo";
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

class LineChart extends Component {
  constructor(props) {
    super(props);
    this.state = {
      lineGraphData: {},
      xGraphData: {},
      yGraphData: {},
      selectedTankId: "",
    };
  }
  render() {
    const {
      lineGraphData,
      xGraphData,
      yGraphData,
      selectedTankId,
    } = this.state;
    return (
      <Fragment>
        <Query query={lineGraph} variables={{ id: this.props.selectedTankId }}>
          {({ data, error, loading }) => {
            if (loading) {
              return (
                <div>
                  <Loader />
                </div>
              );
            }
            if (error) {
              return <div>Error</div>;
            } else if (data) {
              if (
                !Object.keys(lineGraphData).length ||
                String(this.state.selectedTankId) !==
                  String(this.props.selectedTankId)
              )
                this.setState({
                  lineGraphData: { ...data.tank.readings.edges },
                  selectedTankId: this.props.selectedTankId,
                });
              console.log("line graph data", data.tank.readings.edges);
              return (
                data &&
                data.tank && (
                  <>
                    <p>dfghjklkjhgfdghjk</p>
                    {/* <HighchartsReact
                      highcharts={Highcharts}
                      //   options={chartOptions}
                      //   onChange={onFilterDataChangeGraph}
                    /> */}
                  </>
                )
              );
            }
          }}
        </Query>
      </Fragment>
    );
  }
}

export default LineChart;

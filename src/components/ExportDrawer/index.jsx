import React, { Component } from "react";
import { Drawer, Button, Row, Col, Checkbox } from "antd";
import SaveCard from "../SaveCard";
import { DatePicker } from "antd";
import moment from "moment";
import { CSVLink } from "react-csv";
import arrowLeft from "../../assets/images/arrow-left-blue.png";
import print from "../../assets/images/print.png";
import fileExport from "../../assets/images/file-export-white.png";
import "./styles.css";
import { gql } from "apollo-boost";
import { Query } from "react-apollo";
import Loader from "../Loader";
const userId = localStorage.getItem("userId");
const { RangePicker } = DatePicker;
const dateFormat = "YYYY/MM/DD";

const tankTable = gql`
  query tankTableData(
    $id: Int
    $first: Int
    $after: String
    $filter: QueryFilterEntry
  ) {
    locationEntry(id: $id) {
      tanks(
        first: $first
        recursive: true
        after: $after
        filter: [$filter]
        sortDirection: asc
        sortBy: levelPercent
      ) {
        totalCount
        pageInfo {
          endCursor
          hasNextPage
          hasPreviousPage
          startCursor
        }

        edges {
          cursor
          node {
            id
            description
            alarms {
              alarmType
              priority
              alarming
            }
            sensor {
              serialNumber
              id
              lastReportTimestamp
            }
            specifications {
              capacityGallons
              capacity
              capacityUnits
            }
            latestReading {
              gateway {
                serialNumber
                mostRecentTimestamp
              }
              refillPotentialGallons
              levelPercent
              rawQuality
              levelGallons
              temperatureCelsius
              batteryVoltage
            }
            externalId
            typeTags
          }
        }
      }
    }
  }
`;
var csvData = "";
class ExportDrawer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      checked: false,
      csvHeader: [],
      csvData: [],
      tankHistory: [],
      tanksDataId: this.props.tanksDataId,
      pageSize: 10,
      currentPage: 1,
    };
    this.setCSV = this.setCSV.bind(this);
  }
  onChange = (e) => {
    // this.setState({
    //   checked: e.target.checked,
    // });
    // if (e.target.checked === true) {
    //   data.push(CsvData);
    //   console.log(CsvData);
    // }
    console.log(`checked = ${e.target.checked}`);
  };
  setCSV(data) {
    console.log(1);
    let entryHistory = [];
    data.map((item) => {
      entryHistory.push({
        TankNumber: item.node.externalId ? item.node.externalId : "",
        TankName: item.node.description ? item.node.description : "",
        TankStatus: item.node.latestReading
          ? item.node.latestReading.levelPercent != null
            ? item.node.latestReading.levelPercent *
              100 *
              (item.node.specifications
                ? item.node.specifications.capacityGallons / 100
                : 0)
            : 0
          : 0,
        Commodity: "Propane",
        currentVolume: item.node.latestReading
          ? item.node.latestReading === null
            ? item.node.latestReading.levelPercent != null
              ? item.node.latestReading.levelPercent *
                100 *
                (item.node.specifications
                  ? item.node.specifications.capacityGallons / 100
                  : 0)
              : 0
            : "0"
          : "0",
        RefillPotential: item.node.latestReading
          ? item.node.latestReading.refillPotentialGallons
            ? item.node.latestReading.refillPotentialGallons
            : "0"
          : "0",
        TankCapacity: item.node.specifications
          ? item.node.specifications.capacityGallons
          : "",
        Temperature: item.node.latestReading
          ? item.node.latestReading.temperatureCelsius
            ? item.node.latestReading.temperatureCelsius
            : "0"
          : 0,
        Battery: item.node.latestReading
          ? item.node.latestReading.batteryVoltage
            ? item.node.latestReading.batteryVoltage
            : "0"
          : 0,
      });
      return 0;
    });
    csvData = entryHistory;
    console.log("entryHistory", csvData);
  }
  render() {
    const { visible, hideForm, checked } = this.props;
    const { pageSize } = this.state;
    console.log("tanksDataid", this.state.tanksDataId);
    console.log("selectedRowKeys", this.props.selectedCheckboxKeys);
    console.log("Csv===", csvData);
    return (
      <div className="advanced_form">
        <Drawer title="Export" width={620} closable={false} visible={visible}>
          <Query
            query={tankTable}
            variables={{
              id: this.state.tanksDataId,
              first: pageSize,
              after: null,
              // filter: filtercondition,
            }}
          >
            {({ data, error, loading, fetchMore }) => {
              //  <>
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
                csvData = data.locationEntry.tanks.edges;
                console.log("tankExportDrawer", data);
                console.log("csvData", csvData);
                this.setCSV(data.locationEntry.tanks.edges);
                return (
                  data &&
                  data.locationEntry && (
                    <>
                      <img
                        className="hideSearch_form"
                        src={arrowLeft}
                        alt="close"
                        onClick={hideForm}
                      />
                      <div className="advanced_btns">
                        <Button
                          onClick={this.handleSubmit}
                          className="saved_btn"
                          size="large"
                          type="primary"
                        >
                          Current Tanks in View(
                          {data.locationEntry.tanks.totalCount})
                        </Button>
                        <Button
                          onClick={hideForm}
                          size="large"
                          className="filter_btn"
                        >
                          Selected Tanks(
                          {this.props.selectedCheckboxKeys.length || 0})
                        </Button>
                      </div>
                      <SaveCard
                        heading="Tank Date Range to Export"
                        contents={[
                          <div className="saved_searches">
                            <Checkbox onChange={this.onChange}>
                              <RangePicker
                                defaultValue={[
                                  moment("2020/01/01", dateFormat),
                                  moment("2020/01/01", dateFormat),
                                ]}
                                format={dateFormat}
                              />
                            </Checkbox>
                          </div>,
                        ]}
                      />
                      <SaveCard
                        heading="Tank Data to Export"
                        contents={[
                          <div className="saved_searches">
                            <div className="export__data--content">
                              <Checkbox onChange={this.onChange}>
                                {" "}
                                Export All Data Points
                              </Checkbox>
                            </div>
                            <Row gutter={16}>
                              <Col span={12}>
                                <div className="export__data--content">
                                  <Checkbox
                                    onChange={this.onChange}
                                    name="externalId"
                                  >
                                    {" "}
                                    Tank Number
                                  </Checkbox>
                                </div>
                              </Col>
                              <Col span={12}>
                                <div className="export__data--content">
                                  <Checkbox
                                    onChange={this.onChange}
                                    name="description"
                                  >
                                    {" "}
                                    Tank Name
                                  </Checkbox>
                                </div>
                              </Col>
                            </Row>
                            <Row gutter={16}>
                              <Col span={12}>
                                <div className="export__data--content">
                                  <Checkbox
                                    onChange={this.onChange}
                                    name="levelPercent"
                                  >
                                    {" "}
                                    Tank Status
                                  </Checkbox>
                                </div>
                              </Col>
                              <Col span={12}>
                                <div className="export__data--content">
                                  <Checkbox
                                    onChange={this.onChange}
                                    name="sensorStatus"
                                  >
                                    {" "}
                                    Sensor Status
                                  </Checkbox>
                                </div>
                              </Col>
                            </Row>
                            <Row gutter={16}>
                              <Col span={12}>
                                <div className="export__data--content">
                                  <Checkbox
                                    onChange={this.onChange}
                                    name="alerts"
                                  >
                                    {" "}
                                    Alerts
                                  </Checkbox>
                                </div>
                              </Col>
                              <Col span={12}>
                                <div className="export__data--content">
                                  <Checkbox
                                    onChange={this.onChange}
                                    name="commodity"
                                  >
                                    {" "}
                                    Commodity
                                  </Checkbox>
                                </div>
                              </Col>
                            </Row>
                            <Row gutter={16}>
                              <Col span={12}>
                                <div className="export__data--content">
                                  <Checkbox onChange={this.onChange}>
                                    {" "}
                                    Current Volume
                                  </Checkbox>
                                </div>
                              </Col>
                              <Col span={12}>
                                <div className="export__data--content">
                                  <Checkbox onChange={this.onChange}>
                                    {" "}
                                    Refill Potential
                                  </Checkbox>
                                </div>
                              </Col>
                            </Row>
                            <Row gutter={16}>
                              <Col span={12}>
                                <div className="export__data--content">
                                  <Checkbox onChange={this.onChange}>
                                    {" "}
                                    Tank Capacity
                                  </Checkbox>
                                </div>
                              </Col>
                              <Col span={12}>
                                <div className="export__data--content">
                                  <Checkbox
                                    onChange={this.onChange}
                                    name="temperatureCelsius"
                                  >
                                    {" "}
                                    Temperature
                                  </Checkbox>
                                </div>
                              </Col>
                            </Row>
                            <Row gutter={16}>
                              <Col span={12}>
                                <div className="export__data--content">
                                  <Checkbox
                                    onChange={this.onChange}
                                    name="batteryVoltage"
                                  >
                                    {" "}
                                    Battery
                                  </Checkbox>
                                </div>
                              </Col>
                            </Row>
                          </div>,
                        ]}
                      />
                      {/* <SaveCard
            heading="Tank Data Range to Export"
            contents={[
              <div className="saved_searches">
                <Row gutter={16}>
                  <Col span={24}>
                    <div className="export__data--content">
                      <Checkbox onChange={this.onChange}> CSV</Checkbox>
                    </div>
                  </Col>
                </Row>
              </div>,
            ]}
          /> */}
                      <div
                        style={{
                          padding: "10px 16px",
                          textAlign: "right",
                        }}
                      >
                        <CSVLink
                          data={csvData}
                          filename={`tanksRecord-${moment(
                            new Date()
                          ).toISOString()}.csv`}
                        >
                          <Button
                            size="large"
                            className="client_export--btn"
                            icon={
                              <img
                                className="icons"
                                src={fileExport}
                                alt="export"
                              />
                            }
                            type="primary"
                            // onClick={() => {
                            //   const {
                            //     endCursor,
                            //   } = data.locationEntry.tanks.pageInfo;
                            //   console.log(endCursor);
                            //   fetchMore({
                            //     variables: { after: endCursor },
                            //     updateQuery: (
                            //       prevResult,
                            //       { fetchMoreResult }
                            //     ) => {
                            //       console.log("prevResult", prevResult);
                            //       console.log(
                            //         "fetchMoreResult",
                            //         fetchMoreResult
                            //       );
                            //       fetchMoreResult.locationEntry.tanks.edges = [
                            //         ...prevResult.locationEntry.tanks.edges,
                            //         ...fetchMoreResult.locationEntry.tanks
                            //           .edges,
                            //       ];
                            //       // if (!fetchMoreResult)
                            //       //   return [...prevResult, ...fetchMoreResult];
                            //       // return fetchMoreResult;
                            //       return fetchMoreResult;
                            //     },
                            //   });
                            // }}
                          >
                            Export
                          </Button>
                        </CSVLink>
                      </div>
                    </>
                  )
                );
              }
            }}
          </Query>
        </Drawer>
      </div>
    );
  }
}
export default ExportDrawer;

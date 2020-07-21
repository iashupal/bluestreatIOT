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
import { objectEach } from "highcharts";
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
              timestamp
            }
            externalId
            typeTags
          }
        }
      }
    }
  }
`;
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
      checkBoxes: {
        "Tank Number": false,
        "Tank Name": false,
        "Tank Status": false,
        "Sensor Status": false,
        Alerts: false,
        Commodity: false,
        "Current Volume": false,
        "Refill Potential": false,
        "Tank Capacity": false,
        Temperature: false,
        Battery: false,
        timestamp: false,
      },
    };
    this.setCSV = this.setCSV.bind(this);
  }
  onChange = ({ target: { value } }) => {
    const { checkBoxes } = this.state;
    this.setState(
      { checkBoxes: { ...checkBoxes, [value]: !checkBoxes[value] } },
      () => this.setCSV()
    );
  };
  changeAll = ({ target: { checked } }) => {
    const { checkBoxes } = this.state;
    const updates = {};
    Object.keys(checkBoxes).forEach(
      (checkBox) => (updates[checkBox] = checked)
    );
    this.setState({ checkBoxes: { ...updates } }, () => this.setCSV());
  };
  clearCheckBoxes = () => {
    const { checkBoxes } = this.state;
    const updates = {};
    Object.keys(checkBoxes).forEach((checkBox) => (updates[checkBox] = false));
    this.setState({ checkBoxes: { ...updates } });
  };
  setCSV() {
    console.log("setCSV");
    const { checkBoxes } = this.state;
    const { selectedCheckboxKeys, tankData } = this.props;
    let entryHistory = [];
    const filteredData = selectedCheckboxKeys.length
      ? tankData.edges.filter(({ node: { id } }) =>
          selectedCheckboxKeys.includes(id)
        )
      : tankData.edges || [];
    for (const item of filteredData) {
      const alarmValues = { high: 0, medium: 0 };
      item.node.alarms
        .filter(({ alarming }) => alarming)
        .forEach(({ priority }) => {
          priority >= 500 && priority <= 999
            ? alarmValues.medium++
            : alarmValues.high++;
        });

      const fullData = {
        "Tank Number": item.node.externalId ? item.node.externalId : "",
        "Tank Name": item.node.description ? item.node.description : "",
        "Tank Status": item.node.latestReading
          ? item.node.latestReading.levelPercent != null
            ? item.node.latestReading.levelPercent *
              100 *
              (item.node.specifications
                ? item.node.specifications.capacityGallons / 100
                : 0)
            : 0
          : 0,
        "Sensor Status":
          item.node.alarms.alarmType === "sensorMissedReportsAlarm" &&
          item.node.alarms.alarming === true
            ? "True"
            : "False",
        Alerts: `High - ${alarmValues.high} & Medium - ${alarmValues.medium}`,
        Commodity: "Propane",
        "Current Volume": item.node.latestReading
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
        "Refill Potential": item.node.latestReading
          ? item.node.latestReading.refillPotentialGallons
            ? item.node.latestReading.refillPotentialGallons
            : "0"
          : "0",
        "Tank Capacity": item.node.specifications
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
      };

      const selectedCheckboxData = {};
      Object.keys(checkBoxes).forEach((checkbox) => {
        checkBoxes[checkbox] &&
          Object.assign(selectedCheckboxData, {
            [checkbox]: fullData[checkbox],
          });
      });
      entryHistory.push({ ...selectedCheckboxData });
    }
    this.setState({ csvData: [...entryHistory] });
    console.log("setCSVData - ", this.state.csvData);
  }

  render() {
    const { visible, hideForm, checked, tankData } = this.props;
    const { pageSize, checkBoxes } = this.state;
    console.log("tanksDataid -- ", this.props.tanksDataId);
    console.log("selectedCheckboxKeys -- ", this.props.selectedCheckboxKeys);
    console.log("selectedRowKeys", this.props.selectedCheckboxKeys);
    console.log("tankData - ", tankData);

    return (
      <div className="advanced_form">
        <Drawer title="Export" width={620} closable={false} visible={visible}>
          <>
            <img
              className="hideSearch_form"
              src={arrowLeft}
              alt="close"
              onClick={() => (hideForm(), this.clearCheckBoxes())}
            />
            <div className="advanced_btns">
              <Button
                onClick={this.handleSubmit}
                className="saved_btn"
                size="large"
                type="primary"
              >
                Current Tanks in View(
                {tankData ? tankData.totalCount : ""})
              </Button>
              <Button onClick={hideForm} size="large" className="filter_btn">
                Selected Tanks(
                {this.props.selectedCheckboxKeys
                  ? this.props.selectedCheckboxKeys.length
                  : ""}
                )
              </Button>
            </div>
            <SaveCard
              heading="Tank Date Range to Export"
              contents={[
                <div className="saved_searches">
                  <Checkbox
                    onChange={this.onChange}
                    name="timestamp"
                    value="timestamp"
                    checked={checkBoxes["timestamp"]}
                  >
                    <RangePicker

                    // defaultValue={[
                    //   moment("2020/01/01", dateFormat),
                    //   moment("2020/01/01", dateFormat),
                    // ]}
                    // format={dateFormat}
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
                    <Checkbox
                      onChange={this.changeAll}
                      checked={Object.values(checkBoxes).every(
                        (value) => value
                      )}
                    >
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
                          value="Tank Number"
                          checked={checkBoxes["Tank Number"]}
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
                          value="Tank Name"
                          checked={checkBoxes["Tank Name"]}
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
                          value="Tank Status"
                          checked={checkBoxes["Tank Status"]}
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
                          value="Sensor Status"
                          checked={checkBoxes["Sensor Status"]}
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
                          value="Alerts"
                          checked={checkBoxes["Alerts"]}
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
                          value="Commodity"
                          checked={checkBoxes["Commodity"]}
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
                        <Checkbox
                          onChange={this.onChange}
                          value="Current Volume"
                          checked={checkBoxes["Current Volume"]}
                        >
                          {" "}
                          Current Volume
                        </Checkbox>
                      </div>
                    </Col>
                    <Col span={12}>
                      <div className="export__data--content">
                        <Checkbox
                          onChange={this.onChange}
                          value="Refill Potential"
                          checked={checkBoxes["Refill Potential"]}
                        >
                          {" "}
                          Refill Potential
                        </Checkbox>
                      </div>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col span={12}>
                      <div className="export__data--content">
                        <Checkbox
                          onChange={this.onChange}
                          value="Tank Capacity"
                          checked={checkBoxes["Tank Capacity"]}
                        >
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
                          value="Temperature"
                          checked={checkBoxes["Temperature"]}
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
                          value="Battery"
                          checked={checkBoxes["Battery"]}
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
            <div
              style={{
                padding: "10px 16px",
                textAlign: "right",
              }}
            >
              <CSVLink
                data={this.state.csvData}
                filename={`tanksRecord-${moment(new Date()).toISOString()}.csv`}
              >
                <Button
                  size="large"
                  className="client_export--btn"
                  icon={<img className="icons" src={fileExport} alt="export" />}
                  type="primary"
                >
                  Export
                </Button>
              </CSVLink>
            </div>
          </>
        </Drawer>
      </div>
    );
  }
}
export default ExportDrawer;

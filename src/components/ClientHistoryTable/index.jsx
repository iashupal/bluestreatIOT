import React, { Component } from "react";
import { Table, Progress, Popover, Input, Button, Card, Select } from "antd";
import Search from "../Search";
import { DatePicker } from "antd";
import moment from "moment";
import {
  DoubleLeftOutlined,
  DoubleRightOutlined,
  LeftOutlined,
  RightOutlined,
} from "@ant-design/icons";
import ExportDrawer from "../ExportDrawer";
import fileExport from "../../assets/images/file-export-white.png";
import filter from "../../assets/images/filter-blue.png";
import { gql } from "apollo-boost";
import { Query, graphql } from "react-apollo";
import { CSVLink } from "react-csv";
import Loader from "../Loader";
import "../TankTable/index.css";
import "./clientHistory.css";
import "../../../node_modules/antd/dist/antd.compact.css";
const { Option } = Select;

const { RangePicker } = DatePicker;
// const dateFormat = "YYYY/MM/DD";

const tankDetail = gql`
  query tankTableData($id: Int, $after: String, $filter: QueryFilterEntry) {
    tank(id: $id) {
      id
      parent {
        id
        description
      }
      readings(
        first: 10
        after: $after
        sortDirection: desc
        sortBy: timestamp
        filter: [$filter]
      ) {
        totalCount
        pageInfo {
          endCursor
          hasNextPage
          hasPreviousPage
          startCursor
        }
        edges {
          node {
            timestamp
            levelPercent
            temperatureCelsius
            batteryVoltage
            levelGallons
            refillPotentialGallons
            rawQuality
          }
        }
      }
    }
  }
`;
var csvData = "";

class ClientHistoryTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      searched: false,
      searchText: null,
      filtered: false,
      filters: {},
      formVisible: false,
      csvData: [],
      tankHistory: [],
      adlevelvalue: "",
      adlevelOp: "",
      showFilterBtn: false,
      startDate: "",
      endDate: "",
      levelGallonValue: "",
      levelGallonOp: "",
    };

    this.submitFilters = this.submitFilters.bind(this);
    this.clearFilters = this.clearFilters.bind(this);
    this.updateFilter = this.updateFilter.bind(this);
    this.showForm = this.showForm.bind(this);
    this.hideForm = this.hideForm.bind(this);
    this.exportDrawer = this.exportDrawer.bind(this);
    this.setCSV = this.setCSV.bind(this);

    this.columns = [
      {
        title: "Date",
        ellipsis: true,
        sorter: (a, b) => {
          if (a.node.timestamp < b.node.timestamp) {
            return -1;
          } else {
            return 1;
          }
        },
        defaultSortOrder: "descend",
        sortDirections: ["ascend", "descend"],
        key: "tankDetail.node.timestamp",
        dataIndex: "timestamp",
        render: (text, record) => (
          <span>
            {record
              ? moment(record.node.timestamp).format("YYYY-MM-D HH:mm")
              : ""}
          </span>
        ),
      },
      {
        title: "Tank Status",
        // defaultSortOrder: "ascend",
        sortDirections: ["ascend", "descend"],
        sorter: (a, b) => {
          if (
            (a.node ? a.node.levelPercent * 100 : "") <
            (b.node ? b.node.levelPercent * 100 : "")
          ) {
            return -1;
          } else {
            return 1;
          }
        },
        render: (record, progress) => (
          <span>
            <Progress
              percent={Math.round(record ? record.node.levelPercent * 100 : "")}
              strokeLinecap="square"
              strokeColor={
                record != null
                  ? record.node.levelPercent * 100 >= 30
                    ? "var(--color-parrot)"
                    : record.node.levelPercent * 100 < 30 &&
                      record.node.levelPercent * 100 > 10
                    ? "var(--color-yellowish)"
                    : record.node.levelPercent * 100 < 10
                    ? "var(--color-ruby)"
                    : "var(--color-ruby)"
                  : "var(--color-ruby)"
              }
            />
          </span>
        ),
      },
      {
        title: "Current Level",
        sortDirections: ["ascend", "descend"],
        sorter: (a, b) =>
          a
            ? a.node.levelGallons === null
              ? "0 "
              : a.node.levelGallons
            : "" < b.level,
        dataIndex: "level",
        render: (text, record) => (
          <span>
            {record
              ? record.node.levelGallons === null
                ? "0 "
                : record.node.levelGallons
              : ""}{" "}
            G
          </span>
        ),
      },
      {
        title: "Refill Potential Gallons.",
        sortDirections: ["ascend", "descend"],
        sorter: (a, b) => {
          if (
            (a.node ? a.node.refillPotentialGallons * 100 : "") <
            (b.node ? b.node.refillPotentialGallons * 100 : "")
          ) {
            return -1;
          } else {
            return 1;
          }
        },
        dataIndex: "refillPotentialGallons",
        render: (text, record) => (
          <span>
            {record
              ? record.node.refillPotentialGallons === null
                ? "0"
                : record.node.refillPotentialGallons
              : ""}{" "}
            G
          </span>
        ),
      },
      {
        title: "Temp",
        sortDirections: ["ascend", "descend"],
        sorter: (a, b) => {
          if (
            (a.node ? a.node.temperatureCelsius * 100 : "") <
            (b.node ? b.node.temperatureCelsius * 100 : "")
          ) {
            return -1;
          } else {
            return 1;
          }
        },
        dataIndex: "temperatureCelsius",
        key: "tankDetail.node.temperatureCelsius",
        render: (text, record) => (
          <span>
            {record
              ? record.node.temperatureCelsius === null
                ? "0 C"
                : record.node.temperatureCelsius + " " + "C"
              : ""}
          </span>
        ),
      },
      {
        title: "Battery",
        sortDirections: ["ascend", "descend"],
        sorter: (a, b) => {
          if (
            (a.node ? a.node.batteryVoltage : "") <
            (b.node ? b.node.batteryVoltage : "")
          ) {
            return -1;
          } else {
            return 1;
          }
        },
        dataIndex: "batteryVoltage",
        render: (text, record) => (
          <span>
            {record
              ? record.node.batteryVoltage === null
                ? "0 V"
                : record.node.batteryVoltage + " " + "V"
              : "0 V"}
          </span>
        ),
      },
    ];
  }
  showForm() {
    this.setState({
      formVisible: true,
      mode: "advanced",
    });
  }

  showCustomizedForm() {
    this.setState({
      formVisible: true,
      mode: "customized",
      clicked: false,
      //   entry
    });
  }

  exportDrawer() {
    this.setState({
      exportVisibleDrawer: true,
    });
  }

  hideForm() {
    this.setState({
      formVisible: false,
      exportVisibleDrawer: false,
    });
  }

  submitFilters() {
    this.setState({
      filtered: true,
      // filters: this.state.filters,
    });
  }
  clearFilters() {
    this.setState({ filtered: false, filters: {} });
  }

  updateFilter(type, value) {
    let filters = this.state.filters;
    switch (type) {
      case "levelPercent":
        // filters.levelValue = value;
        var op = "",
          levelValue = "";
        console.log("enter function");
        console.log("option selected", value);
        if (value === "below10") {
          op = "<";
          levelValue = "0.10";
          console.log("below 10");
        } else if (value === "below30") {
          op = "<";
          levelValue = "0.30";
        } else if (value === "30to80") {
          op = "<";
          levelValue = "0.80";
        } else if (value === "above80") {
          op = ">";
          levelValue = "0.80";
        }
        // let obj = {};
        // obj.op = op;
        // obj.levelValue = levelValue;
        // filters.levelPercent = obj;
        // this.setState({ filters: obj }, function () {
        //   console.log("function state ----", this.state.filters);
        // });
        // console.log("filters levelpercent", filters);
        this.setState({
          adlevelvalue: levelValue,
          adlevelOp: op,
          showFilterBtn: true,
          // filters: filters,
        });
        break;
      case "timestamp":
        console.log("select date", value);

        this.setState({
          startDate: moment(value[0]).format("YYYY-MM-DD"),
          endDate: moment(value[1]).format("YYYY-MM-DD"),
          showFilterBtn: true,
        });
        break;
      case "levelGallons":
        console.log("level gallons", value);
        this.setState({
          levelGallonOp: value,
          // levelGallonValue: val,
          showFilterBtn: true,
        });
        console.log("level gallons", value);
        console.log("input value", this.state.levelGallonValue);
        break;
      default:
        console.log("Error");
    }

    console.log("tag state", value);
    console.log("level value-----", levelValue);
    console.log("level op----", op);
    console.log("level value state", this.state.adlevelvalue);
    console.log("level op state", this.state.adlevelOp);
  }

  setCSV(data) {
    console.log(1);
    let entryHistory = [];
    data.map((item) => {
      entryHistory.push({
        Date: item.node.timestamp,
        TankStatus: item.node.levelPercent ? item.node.levelPercent : "0",
        CurrentLevel: item.node.levelGallons ? item.node.levelGallons : "0",
        RefillPotentialGallons: item.node.refillPotentialGallons
          ? item.node.refillPotentialGallons
          : "0",
        Temperature: item.node.temperatureCelsius
          ? item.node.temperatureCelsius
          : "0",
        Battery: item.node.batteryVoltage ? item.node.batteryVoltage : "0",
      });
      return 0;
    });
    csvData = entryHistory;
    console.log("entryHistory", csvData);
  }

  render() {
    const {
      searchText,
      searched,
      exportVisibleDrawer,
      filtered,
      filters,
      showFilterBtn,
      startDate,
      endDate,
      levelGallonValue,
      levelGallonOp,
    } = this.state;
    var filtercondition = {};
    console.log("adlevelValue", this.state.adlevelvalue);

    if (filtered) {
      console.log("enter inot filter condn", filters);
      if (this.state.adlevelvalue != "") {
        filtercondition = {
          levelPercent: {
            op: this.state.adlevelOp,
            v: this.state.adlevelvalue,
          },
        };
      } else if (startDate != "" && endDate != "") {
        filtercondition = {
          timestamp: {
            op: ">=",
            v: startDate,
          },
          timestamp: {
            op: "<=",
            v: endDate,
          },
        };
        // filtercondition = {
        //   levelPercent: {
        //     op: this.state.adlevelOp,
        //     v: this.state.adlevelvalue,
        //   },
        //   timestamp: {
        //     op: ">=",
        //     v: startDate,
        //   },
        //   timestamp: {
        //     op: "<=",
        //     v: endDate,
        //   },
        //   // levelPercent: filters,
        // };
        console.log("level Percent-----", filtercondition);
      } else if (levelGallonValue != "" && levelGallonOp != "") {
        filtercondition = {
          levelGallons: {
            op: levelGallonOp,
            v: levelGallonValue,
          },
        };
      }
    }

    console.log("Csv===", csvData);
    return (
      <div className="tank_table">
        <Query
          query={tankDetail}
          variables={{
            id: this.props.selectedTankId,
            after: null,
            filter: filtercondition,
          }}
        >
          {({ data, error, loading, fetchMore }) => {
            if (loading) {
              return (
                <div>
                  <Loader />
                </div>
              );
            }
            if (error) {
              return console.log(JSON.stringify(error));
            } else if (data) {
              csvData = data.tank.readings.edges;
              console.log("tank history", data);
              console.log("csvData", csvData);
              this.setCSV(data.tank.readings.edges);

              return (
                data &&
                data.tank && (
                  <>
                    <Card
                      headStyle={{ fontSize: "1.5rem" }}
                      size="small"
                      title={
                        searched
                          ? `Results for "${searchText}"`
                          : "Client History"
                      }
                      extra={[
                        <Popover
                          content={
                            <div className="history__filter--popover">
                              <p>Tank Status : </p>
                              <Select
                                style={{ width: "100%" }}
                                placeholder="Status"
                                onChange={(value) =>
                                  this.updateFilter("levelPercent", value)
                                }
                                // value={this.state.filters.levelPercent}
                              >
                                <Option value={"below10"}>Below 10%</Option>
                                <Option value={"below30"}>Below 30%</Option>
                                <Option value={"30to80"}>30% to 80%</Option>
                                <Option value={"above80"}>Above 80%</Option>
                              </Select>
                              <br />
                              <br />
                              <p>Select Date Range : </p>
                              <RangePicker
                                // defaultValue={[
                                //   moment("2020/01/01", dateFormat),
                                //   moment("2020/01/01", dateFormat),
                                // ]}
                                onChange={(value) =>
                                  this.updateFilter("timestamp", value)
                                }
                                // format={dateFormat}
                              />
                              <br />
                              <br />
                              <p>Level Gallons</p>
                              <Select
                                style={{ width: "100%" }}
                                placeholder="level gallons"
                                onChange={(value) =>
                                  this.updateFilter("levelGallons", value)
                                }
                                // value={this.state.filters.levelPercent}
                              >
                                <Option value={">="}>
                                  Greater than equal to
                                </Option>
                                <Option value={"<="}>less than equal to</Option>
                                <Option selected value={"=="}>
                                  equal to
                                </Option>
                              </Select>
                              <input
                                className="level_input"
                                type="number"
                                // defaultValue=
                                defaultValue={levelGallonValue}
                                placeholder="Enter check the value of level gallon below this"
                                onChange={(e) =>
                                  this.setState({
                                    levelGallonValue: e.target.defaultValue,
                                  })
                                }
                              />
                              G
                              <br />
                              <br />
                              <Button
                                style={{ width: "100%" }}
                                type={filtered ? "danger" : "primary"}
                                // icon={filtered ? "delete" : "filter"}
                                onClick={
                                  filtered
                                    ? this.clearFilters
                                    : this.submitFilters
                                }
                                disabled={showFilterBtn === false}
                                // disabled={Object.keys(filters).length === 0}
                              >
                                {filtered ? "Clear filters" : "Filter"}
                              </Button>
                            </div>
                          }
                          placement="bottom"
                        >
                          <Button
                            className="client_btn"
                            type="primary"
                            icon={
                              <img
                                className="icons"
                                src={filter}
                                alt="filter"
                              />
                            }
                            size="large"
                            ghost
                          >
                            Filter
                          </Button>
                        </Popover>,
                        <CSVLink
                          data={csvData}
                          filename={`tank_History-${data.tank.id}-${moment(
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
                                alt="print"
                              />
                            }
                            type="primary"
                          >
                            Export
                          </Button>
                          ,
                        </CSVLink>,
                      ]}
                    >
                      <Table
                        dataSource={data.tank.readings.edges}
                        columns={this.columns}
                        size="small"
                        pagination={true}
                      />
                      <div style={{ textAlign: "center" }}>
                        <Button
                          type="primary"
                          size="medium"
                          className="tank__loadmore"
                          onClick={() => {
                            const { endCursor } = data.tank.readings.pageInfo;
                            console.log(endCursor);
                            fetchMore({
                              variables: { after: endCursor },
                              updateQuery: (
                                prevResult,
                                { fetchMoreResult }
                              ) => {
                                console.log("prevResult", prevResult);
                                console.log("fetchMoreResult", fetchMoreResult);
                                fetchMoreResult.tank.readings.edges = [
                                  ...prevResult.tank.readings.edges,
                                  ...fetchMoreResult.tank.readings.edges,
                                ];
                                return fetchMoreResult;
                              },
                            });
                          }}
                        >
                          Load more..
                        </Button>
                      </div>
                    </Card>
                  </>
                )
              );
            }
          }}
        </Query>
      </div>
    );
  }
}
export default ClientHistoryTable;

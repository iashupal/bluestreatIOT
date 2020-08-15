import React, { Component, Fragment } from "react";
import moment from "moment";
import { Link, withRouter } from "react-router-dom";
import { useHistory } from "react-router-dom";
import Header from "../components/Header";
import ClientHistoryTable from "../components/ClientHistoryTable";
import AdvancedSearchForm from "../components/AdvancedSearchForm";
import yellowSquare from "../assets/images/yellow-square.png";
import ContentCard from "../components/ContentCard";
import AnimatedTank from "../components/Chart/AnimatedTank";
import Heading from "../components/Heading";
import TankInfo from "../components/TankInfo";
import arrowLeft from "../assets/images/arrow-left-blue.png";
import dropBlue from "../assets/images/drop-blue.png";
import triangleRed from "../assets/images/triangle-red.png";
import Loader from "../components/Loader";
import wifiGrey from "../assets/images/wifi-grey.png";
import wifiGreen from "../assets/images/wifi-green.png";
import Badge from "../components/Badge";
import "./styles.css";
import { gql } from "apollo-boost";
import { graphql } from "react-apollo";
import LineChart from "../components/LineChart";
import { easeQuadInOut } from "d3-ease";
import SideNav from "../components/SideNav";
import MainLayout from "./MainLayout";
const username = localStorage.getItem("username");
const userId = localStorage.getItem("userId");

const tankDetail = gql`
  query tankTableData($id: Int) {
    tank(id: $id) {
      id
      externalId
      description
      sensor {
        serialNumber
        id
        lastReportTimestamp
      }
      specifications {
        capacityGallons
        capacity
        capacityUnits
        vertical
        heightMeters
        widthMeters
      }
      parent {
        id
        description
        ... on GatewayLocation {
          parent {
            id
            description
          }
        }
      }
      latestReading {
        gateway {
          serialNumber
          mostRecentTimestamp
        }
        refillPotentialGallons
        levelPercent
        rawQuality
        temperatureCelsius
        batteryVoltage
        levelGallons
      }
      alarms {
        alarmType
        priority
        alarming
        parentType
        triggeredAt
        clearedAt
        parent {
          id
          description
        }
      }
      readings(first: 10) {
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

class ClientLayout extends Component {
  constructor(props) {
    super(props);
    this.state = {
      formVisible: false,
      username: username,
      userId: userId,
      render: false,
      description: "",
      selectid: this.props.match.params.id,
      filterChildData: {},
      endDate: new Date(),
      startDate: new Date(new Date().setDate(new Date().getDate() - 30)),
      oneDay: "",
      dateDiff: "",
      newCurrentDate: "",
      clearGraph: false,
      FetchedTankData: [],
    };
    this.showForm = this.showForm.bind(this);
    this.hideForm = this.hideForm.bind(this);
    this.handleBack = this.handleBack.bind(this);
    this.getTankData = this.getTankData.bind(this);
  }

  showForm() {
    this.setState({
      formVisible: true,
      mode: "advanced",
    });
  }
  hideForm() {
    this.setState({
      formVisible: false,
    });
  }
  handleChildClientHistory = (
    filtercondition,
    startDate,
    endDate,
    dateDiff
  ) => {
    this.setState({ filterChildData: filtercondition });
    this.setState({ startDate: startDate });
    this.setState({ endDate: endDate });
    this.setState({ dateDiff: dateDiff });
  };
  handleBack() {
    this.props.history.goBack();
  }

  getTankData(tankData) {
    this.setState({ FetchedTankData: tankData }, function () {
      console.log("tankData", tankData);
    });
    this.state.FetchedTankData = tankData;
  }
  render() {
    let { data } = this.props;
    if (data.loading) {
      return (
        <div>
          <Loader />
        </div>
      );
    }
    console.log("specific tank data", data);

    var alarmTypeName = [];
    const alarmObject = { triggeredAt: "", alarmType: "", priority: 0 };
    const alarmValues = { high: 0, medium: 0, low: 0 };
    const alarmMediumArray = [];
    if (data.tank != null) {
      data.tank.alarms.forEach(
        ({ priority, alarmType, alarming, triggeredAt }) => {
          if (alarming == true) {
            if (priority >= 500 && priority <= 999) {
              alarmValues.medium++;
              alarmMediumArray.push({
                pushedValues: { date: triggeredAt, type: alarmType },
              });
            } else if (priority >= 1000) {
              alarmValues.high++;
              // alarmObject.triggeredAt = triggeredAt;
              // alarmObject.alarmType = alarmType;
              alarmTypeName.push({
                // pushedValues: {
                date: triggeredAt,
                type: alarmType,
                priority: priority,
                // },
              });
              if (alarmObject.priority < priority) {
                alarmObject.priority = priority;
                alarmObject.alarmType = alarmType;
                alarmObject.triggeredAt = triggeredAt;
              }
            } else {
              alarmValues.low++;
            }
          }
        }
      );
    }
    for (let i = 0; i < alarmTypeName.length; i++) {
      for (let j = i; j < alarmTypeName.length; j++) {
        var temp;
        if (alarmTypeName[i].priority < alarmTypeName[j].priority) {
          temp = alarmTypeName[i];
          alarmTypeName[i] = alarmTypeName[j];
          alarmTypeName[j] = temp;
        }
      }
    }

    const highOrMedium = alarmValues.high >= alarmValues.medium;
    const {
      formVisible,
      description,
      username,
      userId,
      mode,
      entry,
      selectid,
      filterChildData,
      startDate,
      endDate,
      clearGraph,
      dateDiff,
      FetchedTankData,
    } = this.state;
    return (
      <Fragment>
        <Header
          tankdescription={data.tank ? data.tank.parent.parent.description : ""}
          tankLocationIdWithName={data.tank ? data.tank.parent.description : ""}
          tankIdWithName={
            data.tank ? `${data.tank.id} ${data.tank.description}` : ""
          }
          username={username}
        />
        <div className="cards">
          <div className="client_wrapper">
            {/* section 1 */}
            <div className="client_top--content">
              <div className="client_left--content">
                <div onClick={this.handleBack}>
                  <img className="hide_form" src={arrowLeft} alt="back_arrow" />
                  <p>
                    {data.tank
                      ? data.tank.parent
                        ? data.tank.parent.description
                        : ""
                      : ""}
                  </p>
                </div>
                {/* </Link> */}
              </div>
              {/* )} */}
              <div className="client_right--content">
                {/* <Search
                  saveIcon
                  styleName="client_search"
                  saveiconStyle="iconStyle"
                />
                <Button
                  className="client_btn"
                  type="primary"
                  icon={<img className="icons" src={filter} alt="filter" />}
                  size="large"
                  ghost
                >
                  Filter
                </Button>
                <Button
                  icon={<img className="icons" src={setting} alt="setting" />}
                  className="client_btn"
                  type="primary"
                  size="large"
                  ghost
                  onClick={this.showForm}
                >
                  Advanced Search
                </Button>
                <Button
                  size="large"
                  className="client_export--btn"
                  icon={<img className="icons" src={fileExport} alt="print" />}
                  type="primary"
                >
                  Export
                </Button> */}
              </div>
            </div>
            {/* section 2 */}
            <div className="client_section2">
              <div className="client_LeftSectn">
                <div className="client_inr--divisn">
                  <div className="client_inr--divisn_tankHeading">
                    <AnimatedTank
                      percentage={
                        data.tank
                          ? data.tank.latestReading
                            ? data.tank.latestReading.levelPercent * 100
                            : ""
                          : ""
                      }
                      duration={1.4}
                      easingFunction={easeQuadInOut}
                      image={dropBlue}
                      percentageSign="%"
                    />
                    <div>
                      <Heading
                        heading={data.tank ? data.tank.id : ""}
                        fontSize="18px"
                      />
                      <Heading
                        heading={data.tank ? data.tank.description : ""}
                        fontSize="18px"
                      />
                    </div>
                  </div>
                  <div className="client_top--alerts">
                    <h3>Current Alerts</h3>
                    <div className="client_alerts--detailedData">
                      {highOrMedium ? (
                        <span>
                          <ContentCard
                            styleName={
                              highOrMedium
                                ? "card_alertred"
                                : "card_alertyellow"
                            }
                            contents={[
                              <div className="alerts">
                                <p>{highOrMedium ? "High" : "Medium"}</p>
                                <img
                                  className="alert_redtriangle"
                                  src={
                                    highOrMedium ? triangleRed : yellowSquare
                                  }
                                  alt="square"
                                />
                              </div>,
                            ]}
                          />
                        </span>
                      ) : (
                        <span>
                          <ContentCard
                            styleName="card_online"
                            contents={[
                              <div className="alerts">
                                <p>Normal</p>
                              </div>,
                            ]}
                          />
                        </span>
                      )}
                    </div>
                    {highOrMedium ? (
                      <div>
                        {alarmValues.high > 0 && (
                          <div>
                            <h4>High Alerts</h4>
                            {alarmTypeName.map((item) => (
                              <div>
                                {/* <ContentCard
                            styleName="card_alertred"
                            contents={[ */}
                                <div className="alerts alerts__grid">
                                  <p className="alerts__desc">
                                    {item.type === "dhsAlarm" ? "DHS" : ""}
                                    {item.type === "sensorMissedReportsAlarm"
                                      ? "Sensor Missed Checkin"
                                      : ""}
                                    {item.type === "critLowLevelAlarm"
                                      ? "Critical Low Level"
                                      : ""}
                                  </p>
                                  <p className="alert_time">
                                    {highOrMedium
                                      ? item.date === null
                                        ? "N/A"
                                        : moment
                                            .utc(item.date)
                                            .format("YYYY-MM-DD HH:mm")
                                      : "N/A"}
                                    {/* {data.tank
                                ? data.tank.alarms.alarmType ===
                                  "sensorMissedReportsAlarm"
                                  ? ""
                                  : moment
                                      .utc(data.tank.alarms[3].triggeredAt)
                                      .format("YYYY-MM-DD HH:mm")
                                : ""} */}
                                  </p>
                                  {/* <img
                              className="alert_redtriangle"
                              src={triangleRed}
                              alt="triangle"
                            /> */}
                                </div>
                                {/* ]}
                          /> */}
                              </div>
                            ))}
                          </div>
                        )}
                        {alarmValues.medium > 0 && (
                          <div>
                            <h4>Medium Alerts</h4>
                            {alarmMediumArray.map((item) => (
                              <div>
                                {/* <ContentCard
                            styleName="card_alertyellow"
                            contents={[ */}
                                <div className="alerts alerts__grid">
                                  {/* <p className="alerts__desc">Low Level</p> */}
                                  <p className="alerts__desc">
                                    {" "}
                                    {item.pushedValues.type === "lowLevelAlarm"
                                      ? "Low Level"
                                      : ""}
                                  </p>
                                  <p className="alert_time">
                                    {item.pushedValues.date === null
                                      ? "N/A"
                                      : moment
                                          .utc(item.pushedValues.date)
                                          .format("YYYY-MM-DD HH:mm")}
                                  </p>
                                </div>
                                {/* ]}
                          /> */}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div>
                        <div>
                          <h4>No Alerts</h4>
                          {/* <ContentCard
                            styleName="card_online"
                            contents={[ */}
                          <div className="alerts">
                            <p className="alerts__desc">No Alerts</p>
                          </div>
                          ,{/* ]}
                          /> */}
                        </div>
                      </div>
                    )}
                  </div>
                  {/* <ContentCard
                    contents={[
                      <div className="client_graph--days">
                        <div className="cleient_graphs">
                          <div className="client_graph--tanks">
                            <div>
                              <AnimatedTank
                                lostpercentage
                                graphDesignStyle
                                percentage={66}
                                duration={1.4}
                                easingFunction={easeQuadInOut}
                                percentageSign="%"
                                percntgStatus="UP TIME"
                              />
                              <img
                                className="client_graph-icons"
                                src={broadcastBlue}
                                alt="broadcast"
                              />
                              <div>
                                <img
                                  className="client_graph-icons"
                                  src={checkGreen}
                                  alt="check_mark"
                                />
                                <p>Good Signal</p>
                              </div>
                            </div>
                            <div>
                              <AnimatedTank
                                lostpercentage
                                graphDesignStyle
                                percentage={66}
                                duration={1.4}
                                easingFunction={easeQuadInOut}
                                percentageSign="%"
                                percntgStatus="SUCCESSFUL"
                              />
                              <img
                                className="client_graph-icons"
                                src={wifiBlue}
                                alt="broadcast"
                              />
                              <div>
                                <img
                                  className="client_graph-icons"
                                  src={checkGreen}
                                  alt="check_mark"
                                />
                                <p>Good Signal</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        <Divider type="vertical" />
                        <div>
                          <div style={{ marginBottom: "10px" }}>
                            <div className="client_tank-signals">
                              <img
                                className="client_graph-icons"
                                src={broadcastBlue}
                                alt="broadcast"
                              />
                              <h3>54</h3>
                              <span>days</span>
                            </div>
                            <p>Consecutive days with a good signal</p>
                          </div>
                          <div>
                            <div className="client_tank-signals">
                              <img
                                className="client_graph-icons"
                                src={wifiBlue}
                                alt="broadcast"
                              />
                              <h3>26</h3>
                              <span>days</span>
                            </div>
                            <p>Consecutive days with a good Reading</p>
                          </div>
                        </div>
                      </div>,
                    ]}
                  /> */}
                  {/* left inr section */}
                  <div className="client_tank--detailedInfo">
                    <div>
                      <TankInfo
                        tankHead="Current Level(L)"
                        tankDetail={
                          data.tank
                            ? data.tank.latestReading
                              ? data.tank.latestReading.levelGallons === null
                                ? "0"
                                : Math.round(
                                    data.tank.latestReading.levelGallons
                                  ).toLocaleString() +
                                  " " +
                                  "G"
                              : "0"
                            : 0
                        }
                      />
                      <TankInfo
                        tankHead="Refill Potential"
                        tankDetail={
                          data.tank
                            ? data.tank.latestReading
                              ? data.tank.latestReading
                                  .refillPotentialGallons === null
                                ? "0"
                                : Math.round(
                                    data.tank.latestReading
                                      .refillPotentialGallons
                                  ).toLocaleString() +
                                  " " +
                                  "G"
                              : "0"
                            : 0
                        }
                      />
                      {/* <TankInfo
                      tankHead="# of Alerts Last 30 Days"
                      tankDetail="1"
                    /> */}
                    </div>
                    <div>
                      <TankInfo
                        tankHead="Current Temp."
                        tankDetail={
                          data.tank
                            ? data.tank.latestReading
                              ? data.tank.latestReading.temperatureCelsius ===
                                null
                                ? "0"
                                : (
                                    data.tank.latestReading.temperatureCelsius *
                                      1.8 +
                                    32
                                  ).toFixed(1) +
                                  " " +
                                  "F"
                              : "0"
                            : 0
                        }
                      />
                      {/* <TankInfo
                      tankHead="Avg. Temp. Last 30 Days"
                      tankDetail="42 F"
                    /> */}
                      <TankInfo
                        tankHead="Battery"
                        tankDetail={
                          data.tank
                            ? data.tank.latestReading
                              ? data.tank.latestReading.batteryVoltage === null
                                ? "0"
                                : data.tank.latestReading.batteryVoltage +
                                  " " +
                                  "V"
                              : "0"
                            : 0
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="client_RghtSectn">
                <LineChart
                  selectedTankId={selectid}
                  passFilteredData={filterChildData}
                  startDate={startDate}
                  endDate={endDate}
                  dateDiff={dateDiff}
                  clearGraph={clearGraph}
                  clearGraphFilter={() => this.setState({ clearGraph: false })}
                  fetchedTankData={FetchedTankData}
                />
              </div>
            </div>
            {/* section 3 */}
            <div className="vertrax_clientLayout">
              <ClientHistoryTable
                selectedTankId={selectid}
                updateParent={this.handleChildClientHistory}
                fetchTankData={(e) =>
                  this.setState({ FetchedTankData: e }, function () {
                    console.log("function state", FetchedTankData);
                  })
                }
                clearGraph={() =>
                  this.setState({
                    clearGraph: true,
                    endDate: "",
                    startDate: "",
                  })
                }
              />
            </div>
          </div>
          <AdvancedSearchForm
            visible={formVisible}
            showForm={this.showForm}
            hideForm={this.hideForm}
            mode={mode}
            entry={entry}
          />
        </div>
      </Fragment>
    );
  }
}

export default graphql(tankDetail, {
  options: (props) => {
    return {
      variables: {
        id: props.match.params.id,
        username: username,
      },
    };
  },
})(ClientLayout);

import React, { Component } from "react";
import { Drawer, Button, Divider, Row, Col, Checkbox, Modal } from "antd";
import SaveCard from "../SaveCard";
import arrowLeft from "../../assets/images/arrow-left-blue.png";
import Search from "../Search";
import { DatePicker } from "antd";
import moment from "moment";
import "./styles.css";
import AdvancedSearchTabs from "../AdvancedSearchTabs";
import Filters from "../Filters";
import save from "../../assets/images/save.png";
import Loader from "../../components/Loader";
import { Tag } from "antd";
import FilterChips from "../FilterChips";
import { gql } from "apollo-boost";
import { graphql, Query, Mutation } from "react-apollo";
import $ from "jquery";
// const Add_Search = gql`
//   mutation ($searchdata: String!) {
//     setUserSavedSearches(savedSearches: { searchdata })
//   }
// `;
const { RangePicker } = DatePicker;
const dateFormat = "YYYY/MM/DD";
const userSavedQuery = gql`
  {
    loggedInUser {
      savedSearches
    }
  }
`;
const POST_MUTATION = gql`
  mutation($savedSearches: JSONObject) {
    setUserSavedSearches(savedSearches: [$savedSearches])
  }
`;

class Popup extends Component {
  render() {
    return (
      // <Modal>
      <div className="popup">
        <div className="popup_inner">
          <h2>{this.props.text}</h2>
          <input
            className="vertrax__tankInput"
            type="text"
            onChange={(e) => this.props.SearchName(e.target.value)}
            placeholder="Enter Name for Save Search"
            required
          />
          <Button
            type="primary"
            size="medium"
            className="popup_closebtn"
            onClick={this.props.closePopup}
          >
            Cancel
          </Button>
          <Button
            type="default"
            size="medium"
            className="popup_btn"
            onClick={this.props.savePopup}
            onClickCapture={this.props.callQuery}
          >
            Save
          </Button>
        </div>
      </div>
      // </Modal>
    );
  }
}

class AdvancedSearchForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showPopup: false,
      exposedFunctions: {},
      temp: [],
      renderSaves: [],
      visible: false,
      tagVisible: false,
      tagVisible1: false,
      advanceReset: false,
      tempadvanceReset: false,
      events: {},
        file: null,
        advancedTab: JSON.parse(localStorage.getItem("advanceTab")),
      filterTab: "",
      tagValue: "",
        tagValue1: localStorage.getItem("tankStatus"),
        tagValue2: localStorage.getItem("adAlert"),
        tagValue3: localStorage.getItem("adSensor"),
        tagValue4: localStorage.getItem("adTankSiveOP"),
        serchtxt: localStorage.getItem("adserchtxt"),
      id: 0,
      saveSearchName: "",
      sizeValue: 0,
        levelGallonValue: localStorage.getItem("adTankSiveV"),
      savedSearches: {},
      tempdata: {
        client: "Test New",
        totalcount: "2",
      },
      disableSearch: true,
      IsSaveSearch: false,
        viewArray: [],
        IsSearchButton: JSON.parse(localStorage.getItem("IsSearchButton")),
        saveSearchesDate: localStorage.getItem("saveSearchesDate"),
        FilterArray: JSON.parse(localStorage.getItem("filterArray"))
    };
  }
  resetSearch() {
    this.setState({ tempadvanceReset: true });

    this.setState({ serchtxt: "" });
    this.state.tagValue = "";
    this.state.tagValue1 = "";
    this.state.tagValue2 = "";
    this.state.tagValue3 = "";
    this.state.tagValue4 = "";
    this.state.FilterArray = [];
    this.state.levelGallonValue = 0;
    // this.state.serchtxt= this.props.initialvalue
    this.state.filterTab = "";
      this.state.IsSearchButton = false;
      localStorage.setItem("IsSearchButton", JSON.parse(false));
      this.props.clearAdvance();
      this.state.advancedTab = 0;
      this.state.saveSearchesDate = "";
  }

  savetogglePopup() {
    if (this.state.saveSearchName == "" && this.state.showPopup == true) {
    } else {
      setInterval(console.log("timer"), 1000);
      this.setState({
        showPopup: !this.state.showPopup,
        advancedTab: 1,
      });
    }
  }

  togglePopup() {
    this.setState({
      showPopup: !this.state.showPopup,
    });
  }
  changeTab = (advancedTab) => {
    this.setState({
      advancedTab,
    });
  };
  changeFilterTab = (filterTab) => {
    this.setState({
      filterTab,
    });
  };
  callfetchValue() {
    this.props.fetchSerachValue(
      this.state.serchtxt,
      this.state.tagValue1,
      this.state.tagValue2,
      this.state.tagValue3,
      this.state.levelGallonValue,
      this.state.tagValue4,
      this.state.FilterArray
    );
  }

  clearValue() {
    this.setState({ serchtxt: "" });
    this.state.tagValue = "";
    this.state.tagValue1 = "";
    this.state.tagValue2 = "";
    this.state.tagValue3 = "";
    this.state.tagValue4 = "";
    this.state.levelGallonValue = 0;
    // this.state.serchtxt= this.props.initialvalue
    this.state.filterTab = "";
    this.state.FilterArray = [];
    this.props.clearFilter();
      this.callfetchValue();
      this.state.saveSearchesDate=""
  }

  saveAdvance() {
    this.updateFiltersFromProps(
      this.state.serchtxt,
      this.state.tagValue1,
      this.state.tagValue2,
      this.state.tagValue3,
      this.state.levelGallonValue,
      this.state.tagValue4
    );
  }

  updateFiltersFromProps(
    serchtxt,
    tankStatus,
    alert,
    sensor,
    tankSizeV,
    tankSizeO
  ) {
    this.state.disableSearch = false;
    if (
      serchtxt == "" &&
      tankStatus == "" &&
      alert == "" &&
      sensor == "" &&
      tankSizeV == 0 &&
      tankSizeO == ""
    )
      this.state.disableSearch = true;
    let { currentId } = this.props;
    let { typeName } = this.props;
    let { saveDescription } = this.props;
    var filtercondition1 = [];

    var op = "",
      value = "";
    if (tankStatus === "Below 10%") {
      op = "<";
      value = "0.10";
    } else if (tankStatus === "Below 30%") {
      op = "<";
      value = "0.30";
    } else if (tankStatus === "30% to 80%") {
      op = "<=";
      value = "0.80";
    } else if (tankStatus === "Above 80%") {
      op = ">";
      value = "0.80";
    }
    if (serchtxt != "")
        filtercondition1.push({
            _or: [
                {
                    description: {
                        op: "match",
                        v: serchtxt,
                    },
                },
                { description: { op: "=", v: serchtxt } }
            ]
        }
      );

    if (tankStatus != "") {
        if (value === "0.80" && op === "<=") {
            filtercondition1.push(
                {
                    levelPercent: {
                        op: op,
                        v: value,
                    },
                },
                {
                    levelPercent: {
                        op: ">=",
                        v: ".30",
                    },
                }
            );
        } else if (value === "0.10" && op === "<") {
            filtercondition1.push({
                _or: [
                    {
                        levelPercent: {
                            op: op,
                            v: value,
                        },
                    },
                    {
                levelPercent: { op: "isNull" },
            }
        ]});
      } else if (value === "0.30" && op === "<") {
        filtercondition1.push(
            {
                _or: [
                    {
                        levelPercent: {
                            op: op,
                            v: value,
                        },
                    },
                    { levelPercent: { op: "isNull" } },
                ]
            });
      } else
            filtercondition1.push({
                _or: [
                    {
                        levelPercent: {
                            op: op,
                            v: value,
                        },
                    }]});
    }

    if (alert == "High") {
      filtercondition1.push({ highAlarmCnt: { op: ">", v: 0 } });
    }
    if (alert == "Medium") {
      filtercondition1.push({ mediumAlarmCnt: { op: ">", v: 0 } });
    }
    if (sensor == "Offline") {
      filtercondition1.push({
        alarmingTypes: { op: "in", v: "sensorMissedReportsAlarm" },
      });
    }
    if (sensor == "Online") {
      filtercondition1.push({
        alarmingTypes: { op: "not in", v: "sensorMissedReportsAlarm" },
      });
    }
    if (tankSizeV != "" && tankSizeO != "")
      filtercondition1.push({
        capacityGallons: {
          op: tankSizeO,
          v: tankSizeV,
        },
      });

    console.log("this.state.temp", this.state.temp);
    var tempSaveSerches = [];
      if ((value === "0.80" && op === "<=") || (value === "0.30" && op === "<" && serchtxt != "") || (value === "0.10" && op === "<" && serchtxt != "") || (value === "0.80" && op === ">" && serchtxt != "") ) {
      tempSaveSerches.push({
        filter: filtercondition1,
        id: currentId,
        date: new Date(),
        name: this.state.saveSearchName,
        typename: typeName,
        description: saveDescription,
      });
    } else {
      tempSaveSerches.push({
        filter: {
          _or: filtercondition1,
        },
        id: currentId,
        date: new Date(),
        name: this.state.saveSearchName,
        typename: typeName,
        description: saveDescription,
      });
    }
    if (this.state.temp != null && this.state.temp.length != undefined) {
      this.state.temp.forEach(function (entry, index) {
        console.log("index", index, entry);
        var searchvar = [];
        searchvar = entry;

        Object.values(searchvar).forEach(function (element, index) {
          if (index < 9) tempSaveSerches.push(element);
        });
      });
    }

    console.log("tempsave serchhdsd", tempSaveSerches);

    this.setState({
      savedSearches: tempSaveSerches,
    });
  }
  getName = (saveSearchName) => {
    this.setState({ saveSearchName }, function () {
      console.log("saveSearches", saveSearchName);
      this.saveAdvance();
    });
  };

  searchBySave(filter, id, typename, description, date) {
      this.state.IsSearchButton = true;
      localStorage.setItem("saveSearchesDate", date);
      localStorage.setItem("IsSearchButton", true);
      localStorage.setItem("advanceTab", JSON.stringify(1));
    this.state.saveSearchesDate = date;
    this.state.IsSaveSearch = true;
    console.log("filter", filter);
      var tempFilterResult = [];
      if (filter._or != undefined) {
          Object.values(filter._or).forEach(function (entry, index) {
              console.log("entry", Object.keys(entry));
              if (Object.keys(entry) == "_or") {
                  Object.values(entry._or).forEach(function (entry1, index) {
                      if (Object.keys(entry1) == "description") {
                          if (entry1.description.op == "match")
                              tempFilterResult.push({
                                  name: "Description",
                                  value: entry1.description.v,
                              });
                      }
                      if (Object.keys(entry1) == "levelPercent") {
                          if (entry1.levelPercent.op == ">") {
                              tempFilterResult.push({
                                  name: "Tank Status",
                                  value: "Above 80%",
                              });
                          }
                          if (entry1.levelPercent.op == "<" && entry1.levelPercent.v == "0.10") {
                              tempFilterResult.push({
                                  name: "Tank Status",
                                  value: "Below 10%",
                              });
                          }
                          if (entry1.levelPercent.op == "<" && entry1.levelPercent.v == "0.30") {
                              tempFilterResult.push({
                                  name: "Tank Status",
                                  value: "Below 30%",
                              });
                          }
                          if (entry1.levelPercent.op == "<=") {
                              tempFilterResult.push({
                                  name: "Tank Status",
                                  value: "30% to 80%",
                              });
                          }
                      }
                  })
              }
              if (Object.keys(entry) == "highAlarmCnt") {
                  tempFilterResult.push({ name: "Alerts", value: "High" });
              }
              if (Object.keys(entry) == "mediumAlarmCnt") {
                  tempFilterResult.push({
                      name: "Alerts",
                      value: "Medimum",
                  });
              }
              if (Object.keys(entry) == "alarmingTypes") {
                  if (entry.alarmingTypes.op == "in") {
                      tempFilterResult.push({
                          name: "Sensor",
                          value: "Offline",
                      });
                  }
                  if (entry.alarmingTypes.op == "not in") {
                      tempFilterResult.push({
                          name: "Sensor",
                          value: "Online",
                      });
                  }
              }
              if (Object.keys(entry) == "capacityGallons") {
                  tempFilterResult.push({
                      name: "Tank Size",
                      value: entry.capacityGallons.op,
                  });
              }
              if (Object.keys(entry) == "levelPercent") {
                  if (entry.levelPercent.op == ">") {
                      tempFilterResult.push({
                          name: "Tank Status",
                          value: "Above 80%",
                      });
                  }
                  if (entry.levelPercent.op == "<" && entry.levelPercent.v == "0.10") {
                      tempFilterResult.push({
                          name: "Tank Status",
                          value: "Below 10%",
                      });
                  }
                  if (entry.levelPercent.op == "<" && entry.levelPercent.v == "0.30") {
                      tempFilterResult.push({
                          name: "Tank Status",
                          value: "Below 30%",
                      });
                  }
                  if (entry.levelPercent.op == "<=") {
                      tempFilterResult.push({
                          name: "Tank Status",
                          value: "30% to 80%",
                      });
                  }
              }
              if (Object.keys(entry) == "description") {
                  if (entry.description.op == "match")
                      tempFilterResult.push({
                          name: "Description",
                          value: entry.description.v,
                      });
              }
          });
      }
      else if (Object.values(filter).length == 1) {
          Object.values(filter).forEach(function (entry1, index) {
              //console.log("entry", Object.keys(entry));
              Object.values(entry1).forEach(function (entry, index) {
                  if (Object.keys(entry) == "highAlarmCnt") {
                      tempFilterResult.push({ name: "Alerts", value: "High" });
                  }
                  if (Object.keys(entry) == "mediumAlarmCnt") {
                      tempFilterResult.push({
                          name: "Alerts",
                          value: "Medimum",
                      });
                  }
                  if (Object.keys(entry) == "alarmingTypes") {
                      if (entry.alarmingTypes.op == "in") {
                          tempFilterResult.push({
                              name: "Sensor",
                              value: "Offline",
                          });
                      }
                      if (entry.alarmingTypes.op == "not in") {
                          tempFilterResult.push({
                              name: "Sensor",
                              value: "Online",
                          });
                      }
                  }
                  if (Object.keys(entry) == "capacityGallons") {
                      tempFilterResult.push({
                          name: "Tank Size",
                          value: entry.capacityGallons.op,
                      });
                  }
                  if (Object.keys(entry) == "levelPercent") {
                      if (entry.levelPercent.op == ">") {
                          tempFilterResult.push({
                              name: "Tank Status",
                              value: "Above 80%",
                          });
                      }
                      if (entry.levelPercent.op == "<" && entry.levelPercent.v == "0.10") {
                          tempFilterResult.push({
                              name: "Tank Status",
                              value: "Below 10%",
                          });
                      }
                      if (entry.levelPercent.op == "<" && entry.levelPercent.v == "0.30") {
                          tempFilterResult.push({
                              name: "Tank Status",
                              value: "Below 30%",
                          });
                      }
                      if (entry.levelPercent.op == "<=") {
                          tempFilterResult.push({
                              name: "Tank Status",
                              value: "30% to 80%",
                          });
                      }
                  }
                  if (Object.keys(entry) == "description") {
                      if (entry.description.op == "match")
                          tempFilterResult.push({
                              name: "Description",
                              value: entry.description.v,
                          });
                  }
              });
          });
      }
      else {
          Object.values(filter).forEach(function (entry, index) {
              if (Object.values(entry).length > 1) {
                  Object.values(entry).forEach(function (entry1, index) {
                      if (Object.keys(entry1) == "levelPercent") {
                          if (entry1.levelPercent.op == ">") {
                              tempFilterResult.push({
                                  name: "Tank Status",
                                  value: "Above 80%",
                              });
                          }
                          if (entry1.levelPercent.op == "<" && entry1.levelPercent.v == "0.10") {
                              tempFilterResult.push({
                                  name: "Tank Status",
                                  value: "Below 10%",
                              });
                          }
                          if (entry1.levelPercent.op == "<" && entry1.levelPercent.v == "0.30") {
                              tempFilterResult.push({
                                  name: "Tank Status",
                                  value: "Below 30%",
                              });
                          }
                          if (entry1.levelPercent.op == "<=") {
                              tempFilterResult.push({
                                  name: "Tank Status",
                                  value: "30% to 80%",
                              });
                          }
                      }
                  });
              }

              if (entry._or != undefined) {
                  Object.values(entry._or).forEach(function (entry1, index) {
                      if (Object.keys(entry1) == "levelPercent") {
                          if (entry1.levelPercent.op == ">") {
                              tempFilterResult.push({
                                  name: "Tank Status",
                                  value: "Above 80%",
                              });
                          }
                          if (entry1.levelPercent.op == "<" && entry1.levelPercent.v == "0.10") {
                              tempFilterResult.push({
                                  name: "Tank Status",
                                  value: "Below 10%",
                              });
                          }
                          if (entry1.levelPercent.op == "<" && entry1.levelPercent.v == "0.30") {
                              tempFilterResult.push({
                                  name: "Tank Status",
                                  value: "Below 30%",
                              });
                          }
                          if (entry1.levelPercent.op == "<=") {
                              tempFilterResult.push({
                                  name: "Tank Status",
                                  value: "30% to 80%",
                              });
                          }
                      }
                      if (Object.keys(entry1) == "description") {
                          if (entry1.description.op == "match")
                              tempFilterResult.push({
                                  name: "Description",
                                  value: entry1.description.v,
                              });
                      }
                  });
              }
              console.log("entry", Object.keys(entry));

              if (Object.keys(entry) == "highAlarmCnt") {
                  tempFilterResult.push({ name: "Alerts", value: "High" });
              }
              if (Object.keys(entry) == "mediumAlarmCnt") {
                  tempFilterResult.push({
                      name: "Alerts",
                      value: "Medimum",
                  });
              }
              if (Object.keys(entry) == "alarmingTypes") {
                  if (entry.alarmingTypes.op == "in") {
                      tempFilterResult.push({
                          name: "Sensor",
                          value: "Offline",
                      });
                  }
                  if (entry.alarmingTypes.op == "not in") {
                      tempFilterResult.push({
                          name: "Sensor",
                          value: "Online",
                      });
                  }
              }
              if (Object.keys(entry) == "capacityGallons") {
                  tempFilterResult.push({
                      name: "Tank Size",
                      value: entry.capacityGallons.op,
                  });
              }
              if (Object.keys(entry) == "levelPercent") {
                  if (entry.levelPercent.op == ">") {
                      tempFilterResult.push({
                          name: "Tank Status",
                          value: "Above 80%",
                      });
                  }
                  if (entry.levelPercent.op == "<" && entry.levelPercent.v =="0.10") {
                      tempFilterResult.push({
                          name: "Tank Status",
                          value: "Below 10%",
                      });
                  }
                  if (entry.levelPercent.op == "<" && entry.levelPercent.v == "0.30") {
                      tempFilterResult.push({
                          name: "Tank Status",
                          value: "Below 30%",
                      });
                  }
                  if (entry.levelPercent.op == "<=") {
                      tempFilterResult.push({
                          name: "Tank Status",
                          value: "30% to 80%",
                      });
                  }
              }
              if (Object.keys(entry) == "description") {
                  if (entry.description.op == "match")
                      tempFilterResult.push({
                          name: "Description",
                          value: entry.description.v,
                      });
              }
          });
      }

    this.state.FilterArray = tempFilterResult;
    console.log("tempFilterResult", this.state.FilterArray);
    this.props.fetchSaveValue(
      filter,
      id,
      typename,
      description,
      this.state.FilterArray
    );
  }
  SavingAdvanceSearch() {
    // console.closeTag("Ad", "SavingAdvanceSearch");
    this.props.SavingAdvanceSearch();
  }
  searchTextfromAdvanceTab(searchtext) {
    this.setState({ serchtxt: searchtext });
    let i = 0;
    let isInclude = false;
    for (i = 0; i < this.state.FilterArray.length; i++) {
      if (this.state.FilterArray[i].name == "Description") break;
    }
    if (this.state.FilterArray.length > 0 && i != this.state.FilterArray.length)
      isInclude = true;
    if (isInclude == false) {
      this.state.FilterArray.push({
        name: "Description",
        value: searchtext,
      });
    } else {
      this.state.FilterArray[i].name = "Description";
      this.state.FilterArray[i].value = searchtext;
      }

      if (searchtext == "") {
          let i = 0;
          if ((this.state.FilterArray.length == 1)) this.state.FilterArray = [];
          else {
              for (i = 0; i < this.state.FilterArray.length; i++) {
                  if (this.state.FilterArray[i].name == "Description") break;
              }
              this.state.FilterArray.splice(i, 1);
          }
      }
    this.saveAdvance();
  }
  showTagChip = (tagValue) => {
    console.log(1);
    this.state.disableSearch = false;
    this.setState({ tagValue, tagVisible: !this.state.tagVisible });
    let i = 0;
    let isInclude = false;
    for (i = 0; i < this.state.FilterArray.length; i++) {
      if (this.state.FilterArray[i].name == "Commodity Type") break;
    }
    if (this.state.FilterArray.length > 0 && i != this.state.FilterArray.length)
      isInclude = true;
    if (tagValue === "Propane" && isInclude == false) {
      this.state.FilterArray.push({
        name: "Commodity Type",
        value: tagValue,
      });
    } else {
      this.state.FilterArray[i].name = "Commodity Type";
      this.state.FilterArray[i].value = tagValue;
    }
    if (this.state.tagValue === "Propane") {
      $("#dvPropane").removeClass("activeSelectedTag");
    }

    $("#dvPropane").addClass("activeSelectedTag");
  };
  showTagstatus = (tagValue1) => {
    console.log(1);
    let i = 0;
    let isInclude = false;
    for (i = 0; i < this.state.FilterArray.length; i++) {
      if (this.state.FilterArray[i].name == "Tank Status") break;
    }
    if (this.state.FilterArray.length > 0 && i != this.state.FilterArray.length)
      isInclude = true;
    if (isInclude == false) {
      this.state.FilterArray.push({
        name: "Tank Status",
        value: tagValue1,
      });
    } else {
      this.state.FilterArray[i].name = "Tank Status";
      this.state.FilterArray[i].value = tagValue1;
    }

    this.setState({ tagValue1 }, function () {
      this.saveAdvance();
      console.log("tagValue1", tagValue1);
    });
    $("#tgStatus").removeClass("ant-tag-hidden");
  };
  showTagAlerts = (tagValue2) => {
    console.log(2);
    let i = 0;
    let isInclude = false;
    for (i = 0; i < this.state.FilterArray.length; i++) {
      if (this.state.FilterArray[i].name == "Alerts") break;
    }
    if (this.state.FilterArray.length > 0 && i != this.state.FilterArray.length)
      isInclude = true;
    if (isInclude == false) {
      this.state.FilterArray.push({
        name: "Alerts",
        value: tagValue2,
      });
    } else {
      this.state.FilterArray[i].name = "Alerts";
      this.state.FilterArray[i].value = tagValue2;
    }
    this.setState({ tagValue2 }, function () {
      this.saveAdvance();
      console.log("tagValue2", tagValue2);
    });
    $("#tgAlerts").removeClass("ant-tag-hidden");
    this.saveAdvance();
  };
  showTagSensor = (tagValue3) => {
    console.log(3);
    let i = 0;
    let isInclude = false;
    for (i = 0; i < this.state.FilterArray.length; i++) {
      if (this.state.FilterArray[i].name == "Sensor") break;
    }
    if (this.state.FilterArray.length > 0 && i != this.state.FilterArray.length)
      isInclude = true;
    if (isInclude == false) {
      this.state.FilterArray.push({
        name: "Sensor",
        value: tagValue3,
      });
    } else {
      this.state.FilterArray[i].name = "Sensor";
      this.state.FilterArray[i].value = tagValue3;
    }
    this.setState({ tagValue3 }, function () {
      this.saveAdvance();
      console.log("tagValue3", tagValue3);
    });
    $("#tgSensor").removeClass("ant-tag-hidden");
  };
  showTagSize = (tagValue4) => {
    console.log(1);
    let i = 0;
    let isInclude = false;
    for (i = 0; i < this.state.FilterArray.length; i++) {
      if (this.state.FilterArray[i].name == "Tank Size") break;
    }
    if (this.state.FilterArray.length > 0 && i != this.state.FilterArray.length)
      isInclude = true;
    if (isInclude == false) {
      this.state.FilterArray.push({
          name: "Tank Size",
          value: tagValue4+" " + this.state.levelGallonValue,
      });
    } else {
      this.state.FilterArray[i].name = "Tank Size";
        this.state.FilterArray[i].value = tagValue4 + " " + this.state.levelGallonValue;
    }
    this.setState({ tagValue4 }, function () {
      this.saveAdvance();
      console.log("tagValue4", tagValue4);
    });
    $("#tgSize").removeClass("ant-tag-hidden");
    };

    setSizeValue = (sizeValue) => {
        this.setState({ levelGallonValue: sizeValue }, function () {
            this.saveAdvance();
        });

        let i = 0;
        let isInclude = false;
        for (i = 0; i < this.state.FilterArray.length; i++) {
            if (this.state.FilterArray[i].name == "Tank Size") break;
        }
        if (this.state.FilterArray.length > 0 && i != this.state.FilterArray.length)
            isInclude = true;
        if (isInclude == false) {
            this.state.FilterArray.push({
                name: "Tank Size",
                value: this.state.tagValue4 + " " + sizeValue,
            });
        } else {
            this.state.FilterArray[i].name = "Tank Size";
            this.state.FilterArray[i].value = this.state.tagValue4 + " " + sizeValue;
        }

    }
  closeTag(e) {
    console.log(e);
  }
  handleClose = () => {
    this.setState({ tagVisible: !this.state.tagVisible });
    if (this.state.tagValue === "Propane") {
      $("#dvPropane").removeClass("activeSelectedTag");
      this.state.tagValue = "";
      this.saveAdvance();
      let i = 0;
      if ((this.state.FilterArray.length == 1)) this.state.FilterArray = [];
      else {
        for (i = 0; i < this.state.FilterArray.length; i++) {
          if (this.state.FilterArray[i].name == "Commodity Type") break;
        }
        this.state.FilterArray.splice(i , 1);
      }
    }
  };
  handleCloseStatus() {
    // this.setState({ tagVisible1: !this.state.tagVisible1 });
    if (this.state.tagValue1 === "Below 10%") {
      $("#below10").removeClass("activeSelectedTag");
    } else if (this.state.tagValue1 === "Below 30%") {
      $("#below30").removeClass("activeSelectedTag");
    } else if (this.state.tagValue1 === "30% to 80%") {
      $("#below30to80").removeClass("activeSelectedTag");
    } else if (this.state.tagValue1 === "Above 80%") {
      $("#above80").removeClass("activeSelectedTag");
    }
    $("#tgStatus").addClass("ant-tag-hidden");
    this.state.tagValue1 = "";
    this.saveAdvance();
    let i = 0;
    if ((this.state.FilterArray.length == 1)) this.state.FilterArray = [];
    else {
      for (i = 0; i < this.state.FilterArray.length; i++) {
        if (this.state.FilterArray[i].name == "Tank Status") break;
      }
      this.state.FilterArray.splice(i , 1);
    }

    //this.callfetchValue();
    // $("#dvTag_Status").remove();
  }
  handleCloseAlerts() {
    if (this.state.tagValue2 === "Medium") {
      $("#medium").removeClass("activeSelectedTag");
    } else if (this.state.tagValue2 === "High") {
      $("#high").removeClass("activeSelectedTag");
    }
    $("#tgAlerts").addClass("ant-tag-hidden");
    this.state.tagValue2 = "";
    this.saveAdvance();
    let i = 0;
    if ((this.state.FilterArray.length == 1)) this.state.FilterArray = [];
    else {
      for (i = 0; i < this.state.FilterArray.length; i++) {
        if (this.state.FilterArray[i].name == "Alerts") break;
      }
      this.state.FilterArray.splice(i , 1);
    }
  }
  handleCloseSensor() {
    if (this.state.tagValue3 === "Online") {
      $("#on").removeClass("activeSelectedTag");
    } else if (this.state.tagValue3 === "Offline") {
      $("#off").removeClass("activeSelectedTag");
    }
    $("#tgSensor").addClass("ant-tag-hidden");
    this.state.tagValue3 = "";
    this.saveAdvance();
    let i = 0;
    if ((this.state.FilterArray.length == 1)) this.state.FilterArray = [];
    else {
      for (i = 0; i < this.state.FilterArray.length; i++) {
        if (this.state.FilterArray[i].name == "Sensor") break;
      }
      this.state.FilterArray.splice(i , 1);
    }
  }
  handleCloseSize() {
    if (this.state.tagValue4 === ">=") {
      $("#greaterthanequalto").removeClass("activeSelectedTag");
    } else if (this.state.tagValue4 === "<=") {
      $("#lessthanequalto").removeClass("activeSelectedTag");
    } else if (this.state.tagValue4 === "=") {
      $("#equalto").removeClass("activeSelectedTag");
    }
    $("#tgSize").addClass("ant-tag-hidden");
    this.state.tagValue4 = "";
    this.saveAdvance();
    let i = 0;
    if ((this.state.FilterArray.length == 1)) this.state.FilterArray = [];
    else {
      for (i = 0; i < this.state.FilterArray.length; i++) {
        if (this.state.FilterArray[i].name == "Tank Size") break;
      }
     this.state.FilterArray.splice(i , 1);
    }
  }
  selectView(column, e) {
    if (e != undefined) {
      if (!this.state.viewArray.includes(column))
        this.state.viewArray.push(column);
      else {
        var index = this.state.viewArray.indexOf(column);
        this.state.viewArray.splice(index, 1);
      }
      console.log("array", this.state.viewArray);
    }
  }
  ShowCustomisedview() {
    this.props.fetchCustomisedView(this.state.viewArray);
  }
  render() {
    const { visible, hideForm, mode, advanceReset, currentId } = this.props;
    if (
      visible === true &&
      advanceReset === true      
    )
      this.resetSearch();

    // console.log("fetchSerachValueeeee", this.props.advanceReset)
    //if (advanceReset === true) {
    //        this.state.tagValue="",
    //        this.state.tagValue1 = "",
    //        this.state.tagValue2 = "",
    //        this.state.tagValue3 = "",
    //        this.state.tagValue4 = "",
    //        this.state.levelGallonValue = ""
    //}
    //this.props.advanceReset = false;

    const {
      advancedTab,
      filterTab,
      tagValue,
      tagValue1,
      tagValue2,
      tagValue3,
      tagValue4,
      temp,
      tagVisible,
      tagVisible1,
      checked,
      saveSearchesDate,
      IsSearchButton,
      sizeValue,
      tempdata,
      savedSearches,
      saveItemArray,
      renderSaves,
      disableSearch,
        serchtxt,
        levelGallonValue
    } = this.state;
    return (
      <div className="advanced_form">
        {this.state.showPopup === true ? (
          <Mutation mutation={POST_MUTATION} variables={{ savedSearches }}>
            {(postMutation) => (
              <Popup
                text="Enter Name"
                closePopup={this.togglePopup.bind(this)}
                savePopup={this.savetogglePopup.bind(this)}
                callQuery={postMutation}
                SearchName={this.getName}
              />
            )}
          </Mutation>
        ) : null}
        {this.state.IsSaveSearch === false && (
          <Query query={userSavedQuery}>
            {({ data, error, loading }) => {
              // <>
              if (loading) {
                return (
                  <div>
                    <Loader />
                  </div>
                );
              }
              if (loading) return "Loading...";
              if (error) return null;
              if (data) {
                this.state.temp = data.loggedInUser.savedSearches;
              }
              return null;
            }}
          </Query>
        )}

        {mode === "advanced" && (
          <Drawer
            title="Advanced Search"
            width={620}
            closable={false}
            visible={visible}
          >
            <img
              className="hideSearch_form"
              src={arrowLeft}
              alt="close"
              onClick={hideForm}
            />
            <Search
              styleName="advanced_search"
              value={serchtxt}
              onChange={(e) => this.searchTextfromAdvanceTab(e.target.value)}
            />

            <div className="advanced_btns">
              <AdvancedSearchTabs
                text="Filters"
                onClick={() => this.changeTab(0)}
                selected={advancedTab === 0}
              />
              <AdvancedSearchTabs
                text="Saved"
                onClick={() => this.changeTab(1)}
                selected={advancedTab === 1}
              />
            </div>
            {advancedTab === 0 && (
              <div>
                {tagValue === "Propane" && (
                  <div className="vertrax-tag">
                    <Tag
                      closable
                      visible={tagVisible}
                      onClose={() => this.handleClose()}
                      className="edit-tag"
                    >
                      <h5>Commodity : </h5> {tagValue}
                    </Tag>
                  </div>
                )}
                {tagValue1 && (
                  <div className="vertrax-tag" id="dvTag_Status">
                    <Tag
                      id="tgStatus"
                      closable
                      // visible={tagVisible1}
                      onClose={() => this.handleCloseStatus()}
                      className="edit-tag"
                    >
                      <h5> Tank status : </h5> {tagValue1}
                    </Tag>
                  </div>
                )}
                {tagValue2 && (
                  <div className="vertrax-tag" id="dvTag_alerts">
                    <Tag
                      id="tgAlerts"
                      closable
                      onClose={() => this.handleCloseAlerts()}
                      className="edit-tag"
                    >
                      <h5> Alerts : </h5> {tagValue2}
                    </Tag>
                  </div>
                )}
                {tagValue3 && (
                  <div className="vertrax-tag" id="dvTag_sensor">
                    <Tag
                      id="tgSensor"
                      closable
                      onClose={() => this.handleCloseSensor()}
                      className="edit-tag"
                    >
                      <h5> Sensors : </h5> {tagValue3}
                    </Tag>
                  </div>
                )}
                {tagValue4 && (
                  <div className="vertrax-tag" id="dvTag_size">
                    <Tag
                      id="tgSize"
                      closable
                      onClose={() => this.handleCloseSize()}
                      className="edit-tag"
                    >
                                        <h5> Tank Size : </h5> {tagValue4}{levelGallonValue}
                    </Tag>
                  </div>
                )}
              </div>
            )}
            {advancedTab === 0 && (
              <div className="advanced_wrapper--filters">
                <div className="advanced_wrapper--inrfilters">
                  <Filters
                    text="Commodity Type"
                    onClick={() => this.changeFilterTab(0)}
                    selected={filterTab === 0}
                  />
                  <Filters
                    text="Tank Status"
                    onClick={() => this.changeFilterTab(1)}
                    selected={filterTab === 1}
                  />
                  <Filters
                    text="Alerts"
                    onClick={() => this.changeFilterTab(2)}
                    selected={filterTab === 2}
                  />
                  <Filters
                    text="Sensors"
                    onClick={() => this.changeFilterTab(3)}
                    selected={filterTab === 3}
                  />
                  <Filters
                    text="Tank Size"
                    onClick={() => this.changeFilterTab(4)}
                    selected={filterTab === 4}
                  />
                </div>
                <Divider type="vertical" />
                <div className="advanced_wrapper--inrfilters">
                  {filterTab === 0 && (
                    <div>
                      <FilterChips
                        id="dvPropane"
                        text="Propane"
                        onClick={() => this.showTagChip("Propane")}
                        selected={tagValue === "Propane"}
                      />
                    </div>
                  )}
                  {filterTab === 1 && (
                    <div>
                      <FilterChips
                        id="below10"
                        text="Below 10%"
                        onClick={() => this.showTagstatus("Below 10%")}
                        selected={tagValue1 === "Below 10%"}
                      />

                      <FilterChips
                        id="below30"
                        text="Below 30%"
                        onClick={() => this.showTagstatus("Below 30%")}
                        selected={tagValue1 === "Below 30%"}
                      />
                      <FilterChips
                        id="below30to80"
                        text="30% to 80%"
                        onClick={() => this.showTagstatus("30% to 80%")}
                        selected={tagValue1 === "30% to 80%"}
                      />
                      <FilterChips
                        id="above80"
                        text="Above 80%"
                        onClick={() => this.showTagstatus("Above 80%")}
                        selected={tagValue1 === "Above 80%"}
                      />
                    </div>
                  )}
                  {filterTab === 2 && (
                    <div>
                      <FilterChips
                        id="medium"
                        text="Medium"
                        onClick={() => this.showTagAlerts("Medium")}
                        selected={tagValue2 === "Medium"}
                      />
                      <FilterChips
                        id="high"
                        text="High"
                        onClick={() => this.showTagAlerts("High")}
                        selected={tagValue2 === "High"}
                      />
                    </div>
                  )}
                  {filterTab === 3 && (
                    <div>
                      <FilterChips
                        id="on"
                        text="Online"
                        onClick={() => this.showTagSensor("Online")}
                        selected={tagValue3 === "Online"}
                      />
                      <FilterChips
                        id="off"
                        text="Offline"
                        onClick={() => this.showTagSensor("Offline")}
                        selected={tagValue3 === "Offline"}
                      />
                    </div>
                  )}
                  {filterTab === 4 && (
                    <div>
                      <input
                        className="vertrax__tankInput"
                        type="number"
                        onChange={(e) => this.setSizeValue(e.target.valueAsNumber)                       
                        }
                        placeholder="Enter value for tank size"
                      />
                      <FilterChips
                        id="greaterthanequalto"
                        text="Greater than equal to"
                        onClick={() => this.showTagSize(">=")}
                        selected={tagValue4 === ">="}
                      />
                      <FilterChips
                        id="lessthanequalto"
                        text="Less than equal to"
                        onClick={() => this.showTagSize("<=")}
                        selected={tagValue4 === "<="}
                      />
                      <FilterChips
                        id="equalto"
                        text="Equal to"
                        onClick={() => this.showTagSize("=")}
                        selected={tagValue4 === "="}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
            {advancedTab === 1 && (
              <div>
                <SaveCard
                  // additionalPoints
                  heading="Saved Searches"
                  contents={[
                    <div className="saved_searches">
                      {
                        <Query query={userSavedQuery}>
                          {({ data, error, loading, refetch }) => {                          
                            if (loading) {
                              return (
                                <div>
                                  <loading />
                                </div>
                                          );
                                      }
                                      refetch();
                           
                            if (error) return `null`;
                            if (data && data.loggedInUser.savedSearches != null) {
                              this.state.renderSaves = Object.values(
                                data.loggedInUser.savedSearches
                              );
                              if (this.state.renderSaves.length > 0)
                                this.state.renderSaves = Object.values(
                                  this.state.renderSaves[0]
                                );
                              console.log("alerts ", this.state.renderSaves);
                              
                              return (
                                <div>
                                  {this.state.renderSaves.map(
                                    (searches, index) => (
                                      <React.Fragment>
                                        {/* <div className="saved_searches--content"> */}
                                        <Button
                                          style={{
                                            backgroundColor:
                                              saveSearchesDate ==
                                                searches.date && IsSearchButton
                                                ? "#90c822"
                                                : "white",
                                            color:
                                              saveSearchesDate ==
                                                searches.date && IsSearchButton
                                                ? "white"
                                                : "black",
                                          }}
                                          size="large"
                                          type="default"
                                          className="savedSearch_btn"
                                          // className="saved_searches--content"
                                          onClick={refetch()}
                                          onClickCapture={() => {
                                            this.searchBySave(
                                              searches.filter,
                                              searches.id,
                                              searches.typename,
                                              searches.description,
                                              searches.date
                                            );
                                          }}
                                        >
                                          {searches.name}{" "}
                                          {moment(searches.date).format(
                                            "YYYY-MM-DD"
                                          )}
                                        </Button>
                                        {/* </div> */}
                                      </React.Fragment>
                                    )
                                  )}
                                  {this.state.renderSaves.length == 0 && (
                                    <div className="saveNotFound">
                                      No searches found
                                    </div>
                                  )}
                                </div>
                              );
                            } else {
                              return (
                                <div>
                                  {this.state.renderSaves.length == 0 && (
                                    <div className="saveNotFound">
                                      No searches found
                                    </div>
                                  )}
                                </div>
                              );
                            }
                          }}
                        </Query>
                      }

                      {/*
                           * 
                             
                              <div className="saved_searches--content">
                                  <strong>Blount Pet</strong>
                                  <span> - 3/13 1:53pm</span>
                              </div>
                              <div className="saved_searches--content">
                                  <strong>Collett</strong>
                                  <span> - 3/12 4:11pm</span>
                              </div>
                              <div className="saved_searches--content">
                                  <strong>Core Fuels</strong>
                                  <span>- 3/11 11:52am</span>
                              </div>*/}
                    </div>,
                  ]}
                />
                <SaveCard
                  heading="Saved Views"
                  contents={[
                    <div className="saved_searches">
                      <div className="saved_searches--content">
                        Default View
                      </div>
                      <div className="saved_searches--content">
                        Saved View 1
                      </div>
                      <div className="saved_searches--content">
                        Saved View 2
                      </div>
                    </div>,
                  ]}
                />
              </div>
            )}
            {advancedTab === 0 && (
              <div className="filter__saveBtn">
                <Button
                  className="saved_btn"
                  size="large"
                  onClick={this.clearValue.bind(this)}
                  // class="ant-btn saved_btn ant-btn-lg"
                >
                  Reset{" "}
                </Button>
                <Button
                  className="saved_btn"
                  size="large"
                  // class="ant-btn saved_btn ant-btn-lg"
                  onClick={this.callfetchValue.bind(this)}
                >
                  Search{" "}
                </Button>

                <Button
                  icon={
                    <img
                      className="btn_icons filter_saveImg"
                      src={save}
                      alt="save"
                    />
                  }
                  size="large"
                  className="saved_btn"
                  onClick={this.togglePopup.bind(this)}
                >
                  Save{" "}
                </Button>
              </div>
            )}
          </Drawer>
        )}
        {mode === "customized" && (
          <Drawer
            title={`Customize View`}
            width={620}
            closable={false}
            visible={visible}
          >
            <img
              className="hideSearch_form"
              src={arrowLeft}
              alt="close"
              onClick={hideForm}
            />

            <SaveCard
              heading="Tank Data to Customize"
              contents={[
                <div className="saved_searches">
                  <Row gutter={16}>
                    <Col span={12}>
                      <div className="export__data--content">
                        <Checkbox onClick={(e) => this.selectView("Number", e)}>
                          {" "}
                          Tank Number
                        </Checkbox>
                      </div>
                    </Col>
                    <Col span={12}>
                      <div className="export__data--content">
                        <Checkbox onClick={(e) => this.selectView("Volume", e)}>
                          {" "}
                          Current Volume
                        </Checkbox>
                      </div>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col span={12}>
                      <div className="export__data--content">
                        <Checkbox
                          onClick={(e) => this.selectView("TankStatus", e)}
                        >
                          {" "}
                          Tank Status
                        </Checkbox>
                      </div>
                    </Col>
                    <Col span={12}>
                      <div className="export__data--content">
                        <Checkbox
                          onClick={(e) => this.selectView("Potential", e)}
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
                          onClick={(e) => this.selectView("GatwayStatus", e)}
                        >
                          {" "}
                          Gateway Status
                        </Checkbox>
                      </div>
                    </Col>
                    <Col span={12}>
                      <div className="export__data--content">
                        <Checkbox
                          onClick={(e) =>
                            this.selectView("RefillPotentialDiff", e)
                          }
                        >
                          {" "}
                          Refill Potential Diff.
                        </Checkbox>
                      </div>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col span={12}>
                      <div className="export__data--content">
                        <Checkbox
                          onClick={(e) => this.selectView("SensorStatus", e)}
                        >
                          {" "}
                          Sensor Status
                        </Checkbox>
                      </div>
                    </Col>
                    <Col span={12}>
                      <div className="export__data--content">
                        <Checkbox
                          onClick={(e) => this.selectView("Tampreture", e)}
                        >
                          {" "}
                          Temp at Tank
                        </Checkbox>
                      </div>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col span={12}>
                      <div className="export__data--content">
                        <Checkbox onClick={(e) => this.selectView("Alerts", e)}>
                          {" "}
                          Alerts
                        </Checkbox>
                      </div>
                    </Col>
                    <Col span={12}>
                      <div className="export__data--content">
                        <Checkbox
                          onClick={(e) => this.selectView("BatteryLevel", e)}
                        >
                          {" "}
                          Battery Level
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
              <Button
                icon={
                  <img
                    className="btn_icons filter_saveImg"
                    src={save}
                    alt="save"
                  />
                }
                size="large"
                className="customize--saved_btn"
                // onClick={() => this.ShowCustomisedview()}
                // className="client_export--btn"
                // onClick={this.SavingAdvanceSearch.bind(this)}
              >
                View
              </Button>
            </div>
          </Drawer>
        )}
      </div>
    );
  }
}

AdvancedSearchForm.defaultProps = {
  selected: false,
};
export default AdvancedSearchForm;

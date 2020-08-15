import React, { Fragment, Component } from "react";
import Header from "../components/Header";
import { Layout } from "antd";
import ArrowButton from "../components/ArrowButton";
import Highcharts from "highcharts/highstock";
import PieChart from "highcharts-react-official";
import MainCard from "../components/MainCard";
import { Button } from "antd";
import cogBlue from "../assets/images/cog-blue.png";
import cogwhite from "../assets/images/cog-white.png";
import Search from "../components/Search";
import Tab from "../components/Tab";
import SubTabs from "../components/SubTabs";
import DeepSubTab from "../components/DeepSubTab";
import GatewayTab from "../components/GatewayTab";
import GatewayTankTab from "../components/GatewayTankTab";
import TankTable from "../components/TankTable";
import AdvancedSearchForm from "../components/AdvancedSearchForm";
import "./styles.css";

import { gql } from "apollo-boost";
//import { gql,useQuery } from '@apollo/client';
import { graphql, Query } from "react-apollo";
import Loader from "../components/Loader";
import SideNav from "../components/SideNav";
import {
  RightOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
} from "@ant-design/icons";
import { subscribe } from "graphql";
import { type } from "jquery";
const userId = localStorage.getItem("userId");
const username = localStorage.getItem("username");

const leftPanel = gql`
  query leftPanelData($id: Int) {
    locationEntry(id: $id) {
      ... on Location {
        sublocations(first: 100, sortDirection: asc, sortBy: description) {
          totalCount
          edges {
            node {
              __typename
              id
              description
            }
          }
        }
      }
    }
  }
`;

let leftPanelwithParent = gql`
  query leftPanelData($id: Int) {
    locationEntry(id: $id) {
      parent {
        id
        description
        parent {
          id
          description
          parent {
            id
            description
            parent {
              id
              description
              parent {
                id
                description
                parent {
                  id
                  description
                }
              }
            }
          }
        }
      }
    }
  }
`;
let leftPanelforNoChild = gql`
  query leftPanelData($id: Int) {
    locationEntry(id: $id) {
      parent {
        id
        description
      }
    }
  }
`;

// const leftGatewayQuery = gql`
//   query leftGatewayPanelData($id: Int) {
//     locationEntry(id: $id) {
//       ... on GatewayLocation {
//         tanks(first: 100) {
//           edges {
//             node {
//               __typename
//               id
//               description
//             }
//           }
//         }
//       }
//     }
//   }
// `;

const { Sider, Content } = Layout;
class MainLayout extends Component {
  constructor(props) {
    super(props);
    this.state = {
      intervalId: 0,
      IsClearFilter: true,
      leftPanelData: [],
      wholeCard: false,
      currentId: localStorage.getItem("userId"),
      currentUserName: localStorage.getItem("username"),
      saveDescription: localStorage.getItem("Description"),
      username: username,
      typeName: localStorage.getItem("typeName"),
      searchTypeName: "Location",
      tab: "",
      saveFilterId: 0,
      subTab: "",
      formVisible: false,
      tankId: "",
      IsparentId: 1,
      selectid: localStorage.getItem("userId"),
      typename: localStorage.getItem("typeName"),
      description: "",
      subDescription: "",
      tankStatus: localStorage.getItem("tankStatus"),
      deepSubTabDesc: "",
      gatewayTabDesc: "",
      gatewayTankTabDesc: "",
      searchValue: "",
      result: JSON.parse(localStorage.getItem("filterListData")),
      adserchtxt: localStorage.getItem("adserchtxt"),
      adlevelvalue: localStorage.getItem("adlevelvalue"),
        adlevelOp: localStorage.getItem("adlevelOp"),
        adLevelGraphValue: localStorage.getItem("adLevelGraphValue"),
        adLevelGraphOP:localStorage.getItem("adLevelGraphOP"),
      adAlert: localStorage.getItem("adAlert"),
      adSensor: localStorage.getItem("adSensor"),
      adTankSiveV: localStorage.getItem("adTankSiveV"),
      adTankSiveOP: localStorage.getItem("adTankSiveOP"),
      selectedTab: false,
      selectedSubTab: false,
      selectedDeepSubTab: false,
      selectedGatewayTab: false,
      selectedGatewayTankTab: false,
      advanceReset: false,
      subChildId: "",
      subTabId: "",
      gatewayId: "",
      gatewayTankId: "",
      adCommodityValue: "Propane",
      collapsed: false,
      filterTableFromGraph: "",
      saveFiler: JSON.parse(localStorage.getItem("saveFilter")),
      leftPanelDefaultData: [],
      isSaveSearch: true,
      IsSearchButton: JSON.parse(localStorage.getItem("IsSearchButton")),
      filterListData: [],
      filterArray: JSON.parse(localStorage.getItem("filterArray")),
    };
    this.changeFullTab = this.changeFullTab.bind(this);
    this.changeHalfTab = this.changeHalfTab.bind(this);
    this.showForm = this.showForm.bind(this);
    this.hideForm = this.hideForm.bind(this);
    this.onSearchingAdvance = this.onSearchingAdvance.bind(this);
    this.onsavingAdvanceSearch = this.onsavingAdvanceSearch.bind(this);
    this.onSearchingSave = this.onSearchingSave.bind(this);
  }
  toggleCollapse = () => this.setState({ collapsed: !this.state.collapsed });
  onsavingAdvanceSearch() {
    // console.log("savingAdvanceSearch");
    this.setState({
      formVisible: false,
    });
    //console.log("testing state",this.state.advanceSerachValue);
  }
  //componentDidMount() {
  //    localStorage.setItem("IsSearchButton", true);
  //}
  //componentDidMount() {
  //    console.log("resultValue", this.state.result);
  //    this.state.adAlert = this.state.result.adAlert;
  //    this.state.adlevelvalue = this.state.result.adlevelvalue;
  //    this.state.adserchtxt = this.state.result.adserchtxt;
  //    this.state.adLevelOP = this.state.result.adlevelOp;
  //    this.state.adSensor = this.state.result.adSensor;
  //    this.state.adTankSiveOP = this.state.result.adTankSiveOP;
  //    this.state.adTankSiveV = this.state.result.adTankSiveV;
  //    console.log("hjkfdhfdhfhdfudhf");
  //}

  onSearchingAdvance(
    valueadvance,
    tankStatus,
    alert,
    sensor,
    tankSizeV,
    tankSizeO,
    filterArray
  ) {
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

    //var show = {
    //    adserchtxt: valueadvance,
    //    adlevelvalue: value,
    //    adlevelOp: op,
    //    adAlert: alert,
    //    adSensor: sensor,
    //    adTankSiveV: tankSizeV,
    //    adTankSiveOP: tankSizeO
    //};
    //this.state.filterListData = show;
    ////filterListData.push(show);
    //localStorage.setItem("filterListData", JSON.stringify(this.state.filterListData));
    //var result = JSON.parse(localStorage.getItem("filterListData"));
    //console.log("hjjfjfjhdf", result.adAlert);
    localStorage.setItem("tankStatus", tankStatus);
    localStorage.setItem("adserchtxt", valueadvance);
    localStorage.setItem("adlevelvalue", value);
    localStorage.setItem("adlevelOp", op);
    localStorage.setItem("adAlert", alert);
    localStorage.setItem("adSensor", sensor);
    localStorage.setItem("adTankSiveV", tankSizeV);
    localStorage.setItem("adTankSiveOP", tankSizeO);
    if (
      valueadvance == "" &&
      tankStatus == "" &&
      alert == "" &&
      sensor == "" &&
      tankSizeO == "" &&
      tankSizeV == 0 &&
      filterArray.length == 0
    ) {
      localStorage.setItem("IsSearchButton", false);
    } else {
      localStorage.setItem("IsSearchButton", true);
    }

    localStorage.setItem("filterArray", JSON.stringify(filterArray));

    this.setState(
      {
        advanceReset: false,
        formVisible: false,
        adserchtxt: valueadvance,
        adlevelvalue: value,
        adlevelOp: op,
        adAlert: alert,
        adSensor: sensor,
        adTankSiveV: tankSizeV,
        adTankSiveOP: tankSizeO,
        saveFiler: {},
        filterArray: filterArray,
        IsSearchButton: JSON.parse(localStorage.getItem("IsSearchButton")),
      },

      function () {
        console.log("function state", this.state.adserchtxt);
      }
    );
    if (
      valueadvance == "" &&
      tankStatus == "" &&
      alert == "" &&
      sensor == "" &&
      tankSizeO == ""
    ) {
      this.state.IsSearchButton = false;
    } else this.state.IsSearchButton = true;
  }

  onSearchingSave(filter, id, typename, description, savefilter) {
    // this.state.isSaveSearch=true
    var leftPanelData = [];
    console.log(
      " this.state.leftPanelDefaultData",
      this.state.leftPanelDefaultData
    );
    localStorage.setItem("Description", description);
    localStorage.setItem("typeName", typename);
    localStorage.setItem("saveFilter", JSON.stringify(filter));
    localStorage.setItem("filterArray", JSON.stringify(savefilter));
    this.setState(
      {
        formVisible: false,
        saveFiler: filter,
        selectid: id,
        isSaveSearch: true,
        typename: typename,
        saveDescription: description,
        IsSearchButton: true,
        filterArray: savefilter,
      },

      function () {
        console.log("function state", this.state.adserchtxt);
      }
    );
    let { data } = this.props;
    if (
      this.props.data.locationEntry &&
      this.props.data.locationEntry.sublocations.edges.length > 0
    ) {
      leftPanelData = this.props.data.locationEntry.sublocations.edges;
    }
    console.log("assadsdafdf", leftPanelData);

    for (let i = 0; i < leftPanelData.length; i++) {
      if (leftPanelData[i].node.id == id) {
        this.changeTab(
          id,
          id,
          this.state.saveDescription,
          this.state.typename,
          false
        );
        break;
      }
    }

    // this.changeTab(this.state.leftPanelDefaultData[0].node.id, this.state.leftPanelDefaultData[0].node.id, this.state.leftPanelDefaultData[0].node.description, this.state.leftPanelDefaultData[0].node.__typename,false)

    //const { loading, error, data } = useQuery(leftPanel, {
    //    variables: {id:this.state.leftPanelDefaultData[0].node.id },
    //});
    //console.log("appollo",data)
  }

  getSaveselectedId() {
    this.state.isSaveSearch = false;
    var parentNode = [];
    var parentHeirachiIds = [
      {
        id: parseInt(this.state.selectid),
        description: this.state.saveDescription,
        __typename: this.state.typename,
      },
    ];
    var loopParameter = true;
    // console.log("leftPanelDefaultData", this.state.leftPanelDefaultData);
    parentNode = this.state.leftPanelDefaultData.parent;
    console.log("parentNode", parentNode);

      if (parentNode != null && this.state.selectid != localStorage.getItem("login_user_id")) {
      for (var i = 0; loopParameter != false; i++) {
        if (parentNode.description == this.state.currentUserName) {
          parentHeirachiIds.push(parentNode);
          loopParameter = false;
          i = i + 1;
        } else {
          parentHeirachiIds.push(parentNode);
          parentNode = parentNode.parent;
        }
      }

      console.log("parentHeirachiIds", parentHeirachiIds);
      var loopParamater2 = 1;
      for (var i = parentHeirachiIds.length - 2; i >= 0; i--) {
        this.state.IsClearFilter = false;
        if (loopParamater2 == 1) {
          this.changeTab(
            parentHeirachiIds[i].id,
            parentHeirachiIds[i].id,
            parentHeirachiIds[i].description,
            parentHeirachiIds[i].__typename,
            false
          );
        }
        if (loopParamater2 == 2) {
          this.changeSubTabs(
            parentHeirachiIds[i].id,
            parentHeirachiIds[i].id,
            parentHeirachiIds[i].description,
            parentHeirachiIds[i].__typename,
            false
          );
        }
        if (loopParamater2 == 3) {
          this.changeDeepSubTabs(
            parentHeirachiIds[i].id,
            parentHeirachiIds[i].id,
            parentHeirachiIds[i].description,
            parentHeirachiIds[i].__typename,
            false
          );
        }
        if (loopParamater2 == 4) {
          this.changeGatewayTab(
            parentHeirachiIds[i].id,
            parentHeirachiIds[i].id,
            parentHeirachiIds[i].description,
            parentHeirachiIds[i].__typename,
            false
          );
        }
        if (loopParamater2 == 5) {
          this.changeGatewayTankTab(
            parentHeirachiIds[i].id,
            parentHeirachiIds[i].id,
            parentHeirachiIds[i].description,
            parentHeirachiIds[i].__typename,
            false
          );
        }
        loopParamater2 = loopParamater2 + 1;
      }
    }
  }
  changeFullTab() {
    this.setState({ wholeCard: true });
  }

  changeHalfTab() {
    this.setState({ wholeCard: false });
  }
  searchTextfromleftTab(searchtext) {
    this.setState({ searchValue: searchtext });
  }

  filterClear() {
    localStorage.setItem("tankStatus", "");
    localStorage.setItem("adserchtxt", "");
    localStorage.setItem("adlevelvalue", "");
    localStorage.setItem("adlevelOp", "");
    localStorage.setItem("adAlert", "");
    localStorage.setItem("adSensor", "");
    localStorage.setItem("adTankSiveV", 0);
    localStorage.setItem("adTankSiveOP", "");
    localStorage.setItem("IsSearchButton", JSON.parse(false));
    localStorage.setItem("filterArray", JSON.stringify([]));
    localStorage.setItem("saveFilter", JSON.stringify({}));
    localStorage.setItem("advanceTab", JSON.stringify(0));
    this.setState({
      adserchtxt: "",
      adlevelvalue: "",
      adlevelOp: "",
      adAlert: "",
      adSensor: "",
      adTankSiveV: "",
      adTankSiveOP: "",
      adLevelGraphValue: "",
      adLevelGraphOP: "",
      IsSearchButton: false,
      filterArray: [],
      advanceReset: true,
      saveFiler: {},
    });
  }
  // scrollStep() {
  //   if (window.pageYOffset === 0) {
  //     clearInterval(this.state.intervalId);
  //   }
  //   window.scroll(0, window.pageYOffset - this.props.scrollStepInPx);
  // }
  changeTab = (tab, id, desc, typename, tabDeselectCondition) => {
    localStorage.setItem("userId", id);
    localStorage.setItem("Description", desc);
    localStorage.setItem("typeName", typename);
      this.state.subChildId = id;
      if (tabDeselectCondition == true) {
          localStorage.setItem("filterArray", JSON.stringify([]));
          localStorage.setItem("saveFilter", JSON.stringify({}));
          localStorage.setItem("IsSearchButton", JSON.parse(false));
          localStorage.setItem("advanceTab", JSON.stringify(0));
          localStorage.setItem("adserchtxt", "");
          localStorage.setItem("adlevelvalue", "");
          localStorage.setItem("adlevelOp", "");
          localStorage.setItem("adAlert", "");
          localStorage.setItem("adSensor", "");
          localStorage.setItem("adTankSiveV", 0);
          localStorage.setItem("adTankSiveOP", "");
          localStorage.setItem("tankStatus", "");

      }
    // let intervalId = setInterval(
    //   this.scrollStep.bind(this)
    //   // this.props.delayInMs
    // );
    if (tabDeselectCondition === true && this.state.selectid == id) {
      tab = "";
        id = userId;
        localStorage.setItem("userId", id);
        localStorage.setItem("filterArray", JSON.stringify([]));
        localStorage.setItem("saveFilter", JSON.stringify({}));
        localStorage.setItem("Description", "");
        localStorage.setItem("adserchtxt", "");
        localStorage.setItem("adlevelvalue", "");
        localStorage.setItem("adlevelOp", "");
        localStorage.setItem("adAlert", "");
        localStorage.setItem("adSensor", "");
        localStorage.setItem("adTankSiveV", 0);
        localStorage.setItem("adTankSiveOP", "");
        localStorage.setItem("tankStatus", "");
      desc = "";
    }
    this.setState({
      currentId: id,
      typeName: typename,
      tab,
      selectid: id,
      description: desc,
      saveDescription: desc,
      typename: typename,
      subtab: "",
      deepsubtab: "",
      gatewaytab: "",
      gatewaytanktab: "",
      subDescription: "",
      deepSubTabDesc: "",
      gatewayTabDesc: "",
      gatewayTankTabDesc: "",
      selectedTab: !tabDeselectCondition,
      // intervalId: intervalId,
    });
    // console.log("typename", typename);
    // console.log("description", desc);
    // console.log("userid1", id);
    if (this.state.IsClearFilter === true) {
        this.state.saveFiler = {};
        this.state.adserchtxt="",
        this.state.adlevelvalue= "",
        this.state.adlevelOp= "",
        this.state.adLevelGraphOP= "",
        this.state.adLevelGraphValue= "",
        this.state.adAlert= "",
        this.state.adSensor= "",
        this.state.adTankSiveV= 0,
        this.state.adTankSiveOP= "",
        this.state.IsSearchButton = false;
        this.state.advanceReset = true;
        this.state.filterArray = [];
    }

    this.state.IsClearFilter = true;
  };

  changeSubTabs = (subtab, id, subDesc, typename, subtabDeselectCondition) => {
    localStorage.setItem("userId", id);
    localStorage.setItem("Description", subDesc);
      localStorage.setItem("typeName", typename);
      if (subtabDeselectCondition == true) {
          localStorage.setItem("filterArray", JSON.stringify([]));
          localStorage.setItem("saveFilter", JSON.stringify({}));
          localStorage.setItem("IsSearchButton", JSON.parse(false));
          localStorage.setItem("advanceTab", JSON.stringify(0));
          localStorage.setItem("adserchtxt", "");
          localStorage.setItem("adlevelvalue", "");
          localStorage.setItem("adlevelOp", "");
          localStorage.setItem("adAlert", "");
          localStorage.setItem("adSensor", "");
          localStorage.setItem("adTankSiveV", 0);
          localStorage.setItem("adTankSiveOP", "");
          localStorage.setItem("tankStatus", "");
      }
    this.state.subTabId = id;
    // let intervalId = setInterval(
    //   this.scrollStep.bind(this)
    //   // this.props.delayInMs
    // );
    if (subtabDeselectCondition === true && this.state.selectid == id) {
      subtab = "";
      id = this.state.subChildId;
        subDesc = "";
        localStorage.setItem("userId", id);
        localStorage.setItem("filterArray", JSON.stringify([]));
        localStorage.setItem("saveFilter", JSON.stringify({}));
        localStorage.setItem("Description", this.state.description);
        localStorage.setItem("adserchtxt", "");
        localStorage.setItem("adlevelvalue", "");
        localStorage.setItem("adlevelOp", "");
        localStorage.setItem("adAlert", "");
        localStorage.setItem("adSensor", "");
        localStorage.setItem("adTankSiveV", 0);
        localStorage.setItem("adTankSiveOP", "");
        localStorage.setItem("tankStatus", "");
    }
    this.setState({
      currentId: id,
      typeName: typename,
      subtab,
      selectid: id,
      subDescription: subDesc,
      saveDescription: subDesc,
      typename: typename,
      deepsubtab: "",
      gatewaytab: "",
      gatewaytanktab: "",
      deepSubTabDesc: "",
      gatewayTabDesc: "",
      gatewayTankTabDesc: "",
      selectedSubTab: !subtabDeselectCondition,
      // intervalId: intervalId,
    });
    // console.log("typename", typename);
    // console.log("subDescription", subDesc);
    if (this.state.IsClearFilter === true) {
        this.state.saveFiler = {};
        this.state.adserchtxt = "",
            this.state.adlevelvalue = "",
            this.state.adlevelOp = "",
            this.state.adLevelGraphOP = "",
            this.state.adLevelGraphValue = "",
            this.state.adAlert = "",
            this.state.adSensor = "",
            this.state.adTankSiveV = 0,
            this.state.adTankSiveOP = "",
      this.state.IsSearchButton = false;
      this.state.advanceReset = true;
      this.state.filterArray = [];
    }

    this.state.IsClearFilter = true;
  };
  changeDeepSubTabs = (
    deepsubtab,
    id,
    deepsubDesc,
    typename,
    deepsubTabDeselectCondition
  ) => {
    localStorage.setItem("userId", id);
    localStorage.setItem("Description", deepsubDesc);
    localStorage.setItem("typeName", typename);
      this.state.gatewayId = id;
      if (deepsubTabDeselectCondition == true) {
          localStorage.setItem("filterArray", JSON.stringify([]));
          localStorage.setItem("saveFilter", JSON.stringify({}));
          localStorage.setItem("IsSearchButton", JSON.parse(false));
          localStorage.setItem("advanceTab", JSON.stringify(0));
          localStorage.setItem("adserchtxt", "");
          localStorage.setItem("adlevelvalue", "");
          localStorage.setItem("adlevelOp", "");
          localStorage.setItem("adAlert", "");
          localStorage.setItem("adSensor", "");
          localStorage.setItem("adTankSiveV", 0);
          localStorage.setItem("adTankSiveOP", "");
          localStorage.setItem("tankStatus", "");
      }
    // let intervalId = setInterval(
    //   this.scrollStep.bind(this)
    //   // this.props.delayInMs
    // );
    if (deepsubTabDeselectCondition === true && this.state.selectid == id) {
      deepsubtab = "";
      id = this.state.subTabId;
        deepsubDesc = "";
        localStorage.setItem("userId", id);
        localStorage.setItem("filterArray", JSON.stringify([]));
        localStorage.setItem("saveFilter", JSON.stringify({}));
        localStorage.setItem("Description", this.state.subDescription);
        localStorage.setItem("adserchtxt", "");
        localStorage.setItem("adlevelvalue", "");
        localStorage.setItem("adlevelOp", "");
        localStorage.setItem("adAlert", "");
        localStorage.setItem("adSensor", "");
        localStorage.setItem("adTankSiveV", 0);
        localStorage.setItem("adTankSiveOP", "");
        localStorage.setItem("tankStatus", "");
    }
    this.setState({
      currentId: id,
      typeName: typename,
      deepsubtab,
      selectid: id,
      deepSubTabDesc: deepsubDesc,
      saveDescription: deepsubDesc,
      typename: typename,
      gatewaytab: "",
      gatewaytanktab: "",
      adTankSiveOP: "",
      gatewayTabDesc: "",
      gatewayTankTabDesc: "",
      selectedDeepSubTab: !deepsubTabDeselectCondition,
      // intervalId: intervalId,
    });
    // console.log("deepSubTabDesc", deepsubDesc);
    if (this.state.IsClearFilter === true) {
        this.state.saveFiler = {};
        this.state.adserchtxt = "",
            this.state.adlevelvalue = "",
            this.state.adlevelOp = "",
            this.state.adLevelGraphOP = "",
            this.state.adLevelGraphValue = "",
            this.state.adAlert = "",
            this.state.adSensor = "",
            this.state.adTankSiveV = 0,
            this.state.adTankSiveOP = "",
      this.state.IsSearchButton = false;
      this.state.advanceReset = true;
      this.state.filterArray = [];
    }

    this.state.IsClearFilter = true;
  };
  changeGatewayTab = (
    gatewaytab,
    id,
    gatewayDesc,
    typename,
    gatewayTabDeselectCondition
  ) => {
    localStorage.setItem("userId", id);
    localStorage.setItem("Description", gatewayDesc);
    localStorage.setItem("typeName", typename);
      this.state.gatewayTankId = id;
      if (gatewayTabDeselectCondition == true) {
          localStorage.setItem("filterArray", JSON.stringify([]));
          localStorage.setItem("saveFilter", JSON.stringify({}));
          localStorage.setItem("IsSearchButton", JSON.parse(false));
          localStorage.setItem("advanceTab", JSON.stringify(0));
          localStorage.setItem("adserchtxt", "");
          localStorage.setItem("adlevelvalue", "");
          localStorage.setItem("adlevelOp", "");
          localStorage.setItem("adAlert", "");
          localStorage.setItem("adSensor", "");
          localStorage.setItem("adTankSiveV", 0);
          localStorage.setItem("adTankSiveOP", "");
          localStorage.setItem("tankStatus", "");
      }
    // let intervalId = setInterval(
    //   this.scrollStep.bind(this)
    //   // this.props.delayInMs
    // );
    if (gatewayTabDeselectCondition === true && this.state.selectid == id) {
      gatewaytab = "";
      id = this.state.gatewayId;
        gatewayDesc = "";
        localStorage.setItem("userId", id);
        localStorage.setItem("filterArray", JSON.stringify([]));
        localStorage.setItem("saveFilter", JSON.stringify({}));
        localStorage.setItem("Description", this.state.deepSubTabDesc);
        localStorage.setItem("adserchtxt", "");
        localStorage.setItem("adlevelvalue", "");
        localStorage.setItem("adlevelOp", "");
        localStorage.setItem("adAlert", "");
        localStorage.setItem("adSensor", "");
        localStorage.setItem("adTankSiveV", 0);
        localStorage.setItem("adTankSiveOP", "");
        localStorage.setItem("tankStatus", "");
    }
    this.setState({
      typeName: typename,
      gatewaytab,
      selectid: id,
      gatewayTabDesc: gatewayDesc,
      saveDescription: gatewayDesc,
      typename: typename,
      gatewaytanktab: "",
      adTankSiveOP: "",
      gatewayTankTabDesc: "",
      selectedGatewayTab: !gatewayTabDeselectCondition,
      // intervalId: intervalId,
    });
    if (this.state.IsClearFilter === true) {
        this.state.saveFiler = {};
        this.state.adserchtxt = "",
            this.state.adlevelvalue = "",
            this.state.adlevelOp = "",
            this.state.adLevelGraphOP = "",
            this.state.adLevelGraphValue = "",
            this.state.adAlert = "",
            this.state.adSensor = "",
            this.state.adTankSiveV = 0,
            this.state.adTankSiveOP = "",
      this.state.IsSearchButton = false;
      this.state.advanceReset = true;
      this.state.filterArray = [];
    }

    this.state.IsClearFilter = true;
  };
  changeGatewayTankTab = (
    gatewaytanktab,
    id,
    gatewaytankDesc,
    typename,
    gatewayTankTabDeselectCondition
  ) => {
    localStorage.setItem("userId", id);
    localStorage.setItem("Description", gatewaytankDesc);
      localStorage.setItem("typeName", typename);
      if (gatewayTankTabDeselectCondition == true) {
          localStorage.setItem("filterArray", JSON.stringify([]));
          localStorage.setItem("saveFilter", JSON.stringify({}));
          localStorage.setItem("IsSearchButton", JSON.parse(false));
          localStorage.setItem("advanceTab", JSON.stringify(0));
          localStorage.setItem("adserchtxt", "");
          localStorage.setItem("adlevelvalue", "");
          localStorage.setItem("adlevelOp", "");
          localStorage.setItem("adAlert", "");
          localStorage.setItem("adSensor", "");
          localStorage.setItem("adTankSiveV", 0);
          localStorage.setItem("adTankSiveOP", "");
          localStorage.setItem("tankStatus", "");
      }
    // let intervalId = setInterval(
    //   this.scrollStep.bind(this)
    //   // this.props.delayInMs
    // );
    if (gatewayTankTabDeselectCondition === true && this.state.selectid == id) {
      gatewaytanktab = "";
      id = this.state.gatewayTankId;
        gatewaytankDesc = "";
        localStorage.setItem("userId", id);
        localStorage.setItem("filterArray", JSON.stringify([]));
        localStorage.setItem("saveFilter", JSON.stringify({}));
        localStorage.setItem("Description", this.state.gatewayTabDesc);
        localStorage.setItem("adserchtxt", "");
        localStorage.setItem("adlevelvalue", "");
        localStorage.setItem("adlevelOp", "");
        localStorage.setItem("adAlert", "");
        localStorage.setItem("adSensor", "");
        localStorage.setItem("adTankSiveV", 0);
        localStorage.setItem("adTankSiveOP", "");
        localStorage.setItem("tankStatus", "");
    }
    this.setState({
      gatewaytanktab,
      typeName: typename,
      selectid: id,
      gatewayTankTabDesc: gatewaytankDesc,
      saveDescription: gatewaytankDesc,
      typename: typename,
      adTankSiveOP: "",
      selectedGatewayTankTab: !gatewayTankTabDeselectCondition,
      // intervalId: intervalId,
    });
    if (this.state.IsClearFilter === true) {
        this.state.saveFiler = {};
        this.state.adserchtxt = "",
            this.state.adlevelvalue = "",
            this.state.adlevelOp = "",
            this.state.adLevelGraphOP = "",
            this.state.adLevelGraphValue = "",
            this.state.adAlert = "",
            this.state.adSensor = "",
            this.state.adTankSiveV = 0,
            this.state.adTankSiveOP = "",
      this.state.IsSearchButton = false;
      this.state.advanceReset = true;
      this.state.filterArray = [];
    }

    this.state.IsClearFilter = true;
  };
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
  handleGraphicClick = (tankStatus) => {
    // console.log("tank id------------------------", this.state.selectid);
    this.setState({ tankId: this.state.selectid });
    // console.log("handle graph data", this.state.tankId);

    var op = "",
      value = "";
    if (tankStatus === "Below 10%") {
      op = "<";
      value = "0.10";
    } else if (tankStatus === "Below 30%") {
      op = "<";
      value = "0.30";
    } else if (tankStatus === "Above 30%") {
      op = ">=";
      value = "0.30";
      }
      localStorage.setItem("adLevelGraphValue", value);
      localStorage.setItem("adLevelGraphOP", op);
    this.setState({
      adLevelGraphValue: value,
      adLevelGraphOP: op,
      saveFiler: {},
      adserchtxt: "",
      adlevelvalue: "",
      adlevelOp: "",
      adAlert: "",
      adSensor: "",
      adTankSiveV: 0,
      adTankSiveOP: "",
      IsSearchButton: false,
      advanceReset: true,
      filterArray: [],
    });
  };

  render() {
    let tempquery = leftPanelforNoChild;
    var temparray = ["one", "two"];
    var tempParentId = this.state.selectid;
    let { data } = this.props;
    var filterdata = [];
    if (data.loading) {
      return (
        <div>
          <Loader />
        </div>
      );
    }
    if (
      this.props.data.locationEntry &&
      this.props.data.locationEntry.sublocations.edges.length > 0
    ) {
      // console.log(
      //   "search data",
      //   this.props.data.locationEntry.sublocations.edges
      // );
      filterdata = this.props.data.locationEntry.sublocations.edges.filter(
        (item) => {
          return (
            item.node.description
              .toString()
              .toLowerCase()
              .indexOf(this.state.searchValue.toString().toLowerCase()) !== -1
          );
        }
      );
    }
    //this.state.leftPanelDefaultData = filterdata;
    // console.log("userId", userId);
    // console.log("filterdata", filterdata);
    // console.log("selectid", this.state.selectid);
    // console.log("desc---", this.state.description);
    // console.log("leftTabs", data);
    // console.log("SelectedId", this.state.selectid);

    const wholeCard = this.state.wholeCard;
    const {
      tab,
      username,
      description,
      subDescription,
      subtab,
      formVisible,
      mode,
      entry,
      deepsubtab,
      gatewaytab,
      deepSubTabDesc,
      gatewaytanktab,
      gatewayTabDesc,
      gatewayTankTabDesc,
      collapsed,
      typename,
      IsSearchButton,
      adAlert,
      selectedTab,
      selectedSubTab,
      selectedDeepSubTab,
      selectedGatewayTab,
      selectedGatewayTankTab,
      tankId,
      isSaveSearch,
      selectid,
      IsparentId,
      filterArray,
    } = this.state;
    let button;
    if (wholeCard) {
      button = (
        <ArrowButton
          iconName="fa-angle-down"
          backgroundColor="var(--color-primary)"
          onClick={this.changeHalfTab}
        />
      );
    } else {
      button = (
        <ArrowButton iconName="fa-angle-up" onClick={this.changeFullTab} />
      );
    }

    return (
      <Fragment>
        <Header tankdescription={description} username={username} />
        <div className="cards">
          <MainCard
            wholeCard={wholeCard}
            selectedTankId={this.state.selectid ? this.state.selectid : ""}
            selectedTypename={typename}
            callTankParent={this.handleGraphicClick}
          />
          {button}
        </div>
        <div className="vertrax_btmSectn">
          <Layout>
            <Sider
              style={{
                overflow: "auto",
                // height: "118vh",
                // height: "112vh",
                height: "100%",
                left: 0,
              }}
              theme="light"
              trigger={null}
              collapsible
              collapsed={collapsed}
              onCollapse={(e) => this.toggleCollapse(e)}
            >
              {/* <div className="app__logo" /> */}
              {/* <SideNav /> */}

              <div className="vertrax_leftSection">
                <div style={{ display: "none" }}>
                  <Search
                    // saveIcon
                    onChange={(e) => this.searchTextfromleftTab(e.target.value)}
                  />
                </div>

                {this.state.isSaveSearch === true && (
                  <Query
                    query={leftPanelwithParent}
                    variables={{ id: selectid }}
                  >
                    {({ data: parentData, error, loading }) => {
                      // <>
                      if (loading) {
                        return (
                          <div>
                            <Loader />
                          </div>
                        );
                      }
                      // if (loading) return "Loading...";
                      if (error) return null;

                      if (parentData) {
                        console.log("parent", parentData);
                        this.state.leftPanelDefaultData =
                          parentData.locationEntry;
                        this.getSaveselectedId();
                      }
                      return null;
                    }}
                  </Query>
                )}
                <div className="tab_wrapper">
                  {filterdata.length > 0 ? (
                    <Fragment>
                      {filterdata.map((item) => (
                        <div>
                          <Tab
                            id="tab1"
                            text={item.node.description}
                            onClick={() =>
                              this.changeTab(
                                item.node.id,
                                item.node.id,
                                item.node.description,
                                item.node.__typename,
                                selectedTab
                              )
                            }
                            selected={tab === item.node.id}
                            alertCount="10"
                            fireCount="2"
                            key={item.node.id}
                          />
                          {tab === item.node.id &&
                            item.node.__typename === "Location" && (
                              <Query
                                query={leftPanel}
                                variables={{ id: item.node.id }}
                              >
                                {({ loading, error, data }) => {
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
                                    // console.log("LocationData", data);
                                    return data.locationEntry.sublocations.edges.map(
                                      (item) => (
                                        <div className="tab_content">
                                          {item.node.__typename ===
                                          "GatewayLocation" ? (
                                            <SubTabs
                                              text={item.node.description}
                                              styleName="tab_branch"
                                              onClick={() =>
                                                this.changeSubTabs(
                                                  item.node.id,
                                                  item.node.id,
                                                  item.node.description,
                                                  item.node.__typename,
                                                  selectedSubTab
                                                )
                                              }
                                              selected={subtab === item.node.id}
                                            />
                                          ) : (
                                            <SubTabs
                                              text={item.node.description}
                                              styleName="tab_branch"
                                              onClick={() =>
                                                this.changeSubTabs(
                                                  item.node.id,
                                                  item.node.id,
                                                  item.node.description,
                                                  item.node.__typename,
                                                  selectedSubTab
                                                )
                                              }
                                              selected={subtab === item.node.id}
                                            />
                                          )}
                                          {subtab === item.node.id &&
                                            item.node.__typename ===
                                              "Location" && (
                                              <Query
                                                query={leftPanel}
                                                variables={{ id: item.node.id }}
                                              >
                                                {({ loading, error, data }) => {
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
                                                    // console.log(
                                                    //   "Locationdatainner",
                                                    //   data
                                                    // );
                                                    return data.locationEntry.sublocations.edges.map(
                                                      (item) => (
                                                        <div className="tab_content subtab_content">
                                                          {item.node
                                                            .__typename ===
                                                          "GatewayLocation" ? (
                                                            // <div className="leftGateway_inrdesc">
                                                            //   {
                                                            //     item.node
                                                            //       .description
                                                            //   }
                                                            // </div>
                                                            <DeepSubTab
                                                              text={
                                                                item.node
                                                                  .description
                                                              }
                                                              onClick={() =>
                                                                this.changeDeepSubTabs(
                                                                  item.node.id,
                                                                  item.node.id,
                                                                  item.node
                                                                    .description,
                                                                  item.node
                                                                    .__typename,
                                                                  selectedDeepSubTab
                                                                )
                                                              }
                                                              selected={
                                                                deepsubtab ===
                                                                item.node.id
                                                              }
                                                            />
                                                          ) : (
                                                            <DeepSubTab
                                                              text={
                                                                item.node
                                                                  .description
                                                              }
                                                              onClick={() =>
                                                                this.changeDeepSubTabs(
                                                                  item.node.id,
                                                                  item.node.id,
                                                                  item.node
                                                                    .description,
                                                                  item.node
                                                                    .__typename,
                                                                  selectedDeepSubTab
                                                                )
                                                              }
                                                              selected={
                                                                deepsubtab ===
                                                                item.node.id
                                                              }
                                                            />
                                                          )}
                                                          {deepsubtab ===
                                                            item.node.id &&
                                                            item.node
                                                              .__typename ===
                                                              "Location" && (
                                                              <Query
                                                                query={
                                                                  leftPanel
                                                                }
                                                                variables={{
                                                                  id:
                                                                    item.node
                                                                      .id,
                                                                }}
                                                              >
                                                                {({
                                                                  loading,
                                                                  error,
                                                                  data,
                                                                }) => {
                                                                  if (loading) {
                                                                    return (
                                                                      <div>
                                                                        <Loader />
                                                                      </div>
                                                                    );
                                                                  }
                                                                  if (error) {
                                                                    return (
                                                                      <div>
                                                                        error
                                                                      </div>
                                                                    );
                                                                  } else if (
                                                                    data
                                                                  ) {
                                                                    // console.log(
                                                                    //   "deepsubtab",
                                                                    //   data
                                                                    // );
                                                                    return data.locationEntry.sublocations.edges.map(
                                                                      (
                                                                        item
                                                                      ) => (
                                                                        <div className="tab_content subtab_content">
                                                                          {item
                                                                            .node
                                                                            .__typename ===
                                                                          "GatewayLocation" ? (
                                                                            // <div className="leftGateway_inrdesc">
                                                                            //   {
                                                                            //     item
                                                                            //       .node
                                                                            //       .description
                                                                            //   }
                                                                            // </div>
                                                                            <GatewayTab
                                                                              text={
                                                                                item
                                                                                  .node
                                                                                  .description
                                                                              }
                                                                              onClick={() =>
                                                                                this.changeGatewayTab(
                                                                                  item
                                                                                    .node
                                                                                    .id,
                                                                                  item
                                                                                    .node
                                                                                    .id,
                                                                                  item
                                                                                    .node
                                                                                    .description,
                                                                                  item
                                                                                    .node
                                                                                    .__typename,
                                                                                  selectedGatewayTab
                                                                                )
                                                                              }
                                                                              selected={
                                                                                gatewaytab ===
                                                                                item
                                                                                  .node
                                                                                  .id
                                                                              }
                                                                            />
                                                                          ) : (
                                                                            <GatewayTab
                                                                              text={
                                                                                item
                                                                                  .node
                                                                                  .description
                                                                              }
                                                                              onClick={() =>
                                                                                this.changeGatewayTab(
                                                                                  item
                                                                                    .node
                                                                                    .id,
                                                                                  item
                                                                                    .node
                                                                                    .id,
                                                                                  item
                                                                                    .node
                                                                                    .description,
                                                                                  item
                                                                                    .node
                                                                                    .__typename,
                                                                                  selectedGatewayTab
                                                                                )
                                                                              }
                                                                              selected={
                                                                                gatewaytab ===
                                                                                item
                                                                                  .node
                                                                                  .id
                                                                              }
                                                                            />
                                                                          )}
                                                                          {gatewaytab ===
                                                                            item
                                                                              .node
                                                                              .id &&
                                                                            item
                                                                              .node
                                                                              .__typename ===
                                                                              "Location" && (
                                                                              <Query
                                                                                query={
                                                                                  leftPanel
                                                                                }
                                                                                variables={{
                                                                                  id:
                                                                                    item
                                                                                      .node
                                                                                      .id,
                                                                                }}
                                                                              >
                                                                                {({
                                                                                  loading,
                                                                                  error,
                                                                                  data,
                                                                                }) => {
                                                                                  if (
                                                                                    loading
                                                                                  ) {
                                                                                    return (
                                                                                      <div>
                                                                                        <Loader />
                                                                                      </div>
                                                                                    );
                                                                                  }
                                                                                  if (
                                                                                    error
                                                                                  ) {
                                                                                    return (
                                                                                      <div>
                                                                                        error
                                                                                      </div>
                                                                                    );
                                                                                  } else if (
                                                                                    data
                                                                                  ) {
                                                                                    // console.log(
                                                                                    //   "gatewayTab",
                                                                                    //   data
                                                                                    // );
                                                                                    return data.locationEntry.sublocations.edges.map(
                                                                                      (
                                                                                        item
                                                                                      ) => (
                                                                                        <div className="tab_content subtab_content">
                                                                                          <GatewayTankTab
                                                                                            text={
                                                                                              item
                                                                                                .node
                                                                                                .description
                                                                                            }
                                                                                            onClick={() =>
                                                                                              this.changeGatewayTankTab(
                                                                                                item
                                                                                                  .node
                                                                                                  .id,
                                                                                                item
                                                                                                  .node
                                                                                                  .id,
                                                                                                item
                                                                                                  .node
                                                                                                  .description,
                                                                                                item
                                                                                                  .node
                                                                                                  .__typename,
                                                                                                selectedGatewayTankTab
                                                                                              )
                                                                                            }
                                                                                            selected={
                                                                                              gatewaytanktab ===
                                                                                              item
                                                                                                .node
                                                                                                .id
                                                                                            }
                                                                                          />
                                                                                        </div>
                                                                                      )
                                                                                    );
                                                                                  }
                                                                                }}
                                                                              </Query>
                                                                            )}
                                                                        </div>
                                                                      )
                                                                    );
                                                                  }
                                                                }}
                                                              </Query>
                                                            )}
                                                        </div>
                                                      )
                                                    );
                                                  }
                                                }}
                                              </Query>
                                            )}
                                        </div>
                                      )
                                    );
                                  }
                                }}
                              </Query>
                            )}
                        </div>
                      ))}
                    </Fragment>
                  ) : (
                    ""
                  )}
                </div>
              </div>
            </Sider>
            <Content>
              <div className="vertrax_rightSectn">
                <div className="vertrax_table--header">
                  {description === description ? (
                    <div className="vertrax_rightSectn--header">
                      <div className="vertrax_header--all">
                        <div>
                          {!collapsed ? (
                            <MenuFoldOutlined
                              className="app__navTrigger"
                              onClick={() => this.toggleCollapse(collapsed)}
                            />
                          ) : (
                            <MenuUnfoldOutlined
                              className="app__navTrigger"
                              onClick={() => this.toggleCollapse(collapsed)}
                            />
                          )}

                          {description === "" ? (
                            <h4>
                              {description === "" ? "All Clients" : description}
                            </h4>
                          ) : (
                            <h4>{description}</h4>
                          )}
                        </div>

                        {subDescription === "" ? (
                          ""
                        ) : (
                          <div>
                            <RightOutlined
                              style={{ color: "#215CAA", fontSize: "18px" }}
                            />
                            <h4>{subDescription}</h4>
                          </div>
                        )}
                        {deepSubTabDesc === "" ? (
                          ""
                        ) : (
                          <div>
                            <RightOutlined
                              style={{ color: "#215CAA", fontSize: "18px" }}
                            />
                            <h4>{deepSubTabDesc}</h4>
                          </div>
                        )}
                        {gatewayTabDesc === "" ? (
                          ""
                        ) : (
                          <div>
                            <RightOutlined
                              style={{ color: "#215CAA", fontSize: "18px" }}
                            />
                            <h4>{gatewayTabDesc}</h4>
                          </div>
                        )}
                        {gatewayTankTabDesc === "" ? (
                          ""
                        ) : (
                          <div>
                            <RightOutlined
                              style={{ color: "#215CAA", fontSize: "18px" }}
                            />
                            <h4>{gatewayTankTabDesc}</h4>
                          </div>
                        )}
                      </div>

                      <div className="vertrax_header--filters">
                        {filterArray.length > 0 && (
                          <h4 className="applied__filter">
                            Applied Filters :-
                          </h4>
                        )}
                        {filterArray.map((item) => (
                          // <div className="vertrax_header--all">
                          <div>
                            <h4 className="adv__filter--header">
                              {item.name} : {item.value}
                            </h4>
                          </div>
                        ))}
                        {filterArray.length > 0 && (
                          <div className="">
                            <Button
                              type="danger"
                              size="small"
                              className="remove__tableFilter"
                              onClick={() => this.filterClear()}
                            >
                              Clear
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    ""
                  )}

                  {IsSearchButton ? (
                    <Button
                      className="client_btn client_btn--selected"
                      type="primary"
                      icon={
                        <img
                          className="btn_icons"
                          src={IsSearchButton ? cogwhite : cogBlue}
                          alt="setting"
                        />
                      }
                      size="large"
                      onClick={this.showForm}
                    >
                      Advanced Search
                    </Button>
                  ) : (
                    <Button
                      className="client_btn"
                      type="primary"
                      ghost
                      icon={
                        <img
                          className="btn_icons"
                          src={cogBlue}
                          alt="setting"
                        />
                      }
                      size="large"
                      onClick={this.showForm}
                    >
                      Advanced Search
                    </Button>
                  )}

                  {/* </div> */}
                </div>
                <TankTable
                  selectedTankId={this.state.selectid}
                  adSearchValue={this.state.adserchtxt}
                  adLevelValue={this.state.adlevelvalue}
                  adLevelOP={this.state.adlevelOp}
                  adAlert={this.state.adAlert}
                  adSensor={this.state.adSensor}
                  adTankSiveV={this.state.adTankSiveV}
                  adTankSiveOP={this.state.adTankSiveOP}
                  adCommodityValue={this.state.adCommodityValue}
                  saveFiler={this.state.saveFiler}
                  saveFilterId={this.state.saveFilterId}
                  adLevelGraphValue={this.state.adLevelGraphValue}
                  adLevelGraphOP={this.state.adLevelGraphOP}
                  // callback={tankId}
                />
              </div>
            </Content>
          </Layout>
        </div>
        <AdvancedSearchForm
          visible={formVisible}
          showForm={this.showForm}
          hideForm={this.hideForm}
          mode={mode}
          entry={entry}
          fetchSerachValue={this.onSearchingAdvance}
          fetchSaveValue={this.onSearchingSave}
          initialvalue={this.state.adserchtxt}
          advanceReset={this.state.advanceReset}
          SavingAdvanceSearch={this.onsavingAdvanceSearch}
          currentId={this.state.currentId}
          typeName={this.state.typeName}
          saveDescription={this.state.saveDescription}
          clearAdvance={() => this.setState({ advanceReset: false })}
          clearFilter={() =>
            this.setState({
              adserchtxt: "",
              adlevelvalue: "",
              adlevelOp: "",
              adAlert: "",
              adSensor: "",
              adTankSiveV: "",
              adTankSiveOP: "",
              adLevelGraphValue: "",
              adLevelGraphOP: "",
              IsSearchButton: false,
            })
          }
        />
      </Fragment>
    );
  }
}

export default graphql(leftPanel, {
  options: (props) => {
    return {
      variables: {
        id: userId,
        username: username,
      },
    };
  },
})(MainLayout);

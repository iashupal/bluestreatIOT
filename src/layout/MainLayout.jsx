import React, { Fragment, Component } from "react";
import Header from "../components/Header";
import { Layout } from "antd";
import ArrowButton from "../components/ArrowButton";
import MainCard from "../components/MainCard";
import { Button } from "antd";
import cogBlue from "../assets/images/cog-blue.png";
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
      leftPanelData: [],
      wholeCard: false,
      username: username,
      tab: "",
      subTab: "",
      formVisible: false,
      selectid: userId,
      typename: "",
      description: "",
      subDescription: "",
      deepSubTabDesc: "",
      gatewayTabDesc: "",
      gatewayTankTabDesc: "",
      searchValue: "",
      adserchtxt: "",
      adlevelvalue: "",
      adlevelOp: "",
      collapsed: false,
    };
    this.changeFullTab = this.changeFullTab.bind(this);
    this.changeHalfTab = this.changeHalfTab.bind(this);
    this.showForm = this.showForm.bind(this);
    this.hideForm = this.hideForm.bind(this);
    this.onSearchingAdvance = this.onSearchingAdvance.bind(this);
    this.onsavingAdvanceSearch = this.onsavingAdvanceSearch.bind(this);
  }
  toggleCollapse = () => this.setState({ collapsed: !this.state.collapsed });
  onsavingAdvanceSearch() {
    console.log("savingAdvanceSearch");
    this.setState({
      formVisible: false,
    });
    //console.log("testing state",this.state.advanceSerachValue);
  }

  onSearchingAdvance(valueadvance, tagValue) {
    var op = "",
      value = "";
    if (tagValue === "Below 10%") {
      op = "<";
      value = "0.10";
    } else if (tagValue === "Below 30%") {
      op = "<";
      value = "0.30";
    } else if (tagValue === "Below 30% to 80%") {
      op = "<";
      value = "0.80";
    } else if (tagValue === "Above 80%") {
      op = ">";
      value = "0.80";
    }
    this.setState(
      {
        formVisible: false,
        adserchtxt: valueadvance,
        adlevelvalue: value,
        adlevelOp: op,
      },
      function () {
        console.log("function state", this.state.adserchtxt);
      }
    );
    console.log("tag state", tagValue);
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

  changeTab = (tab, id, desc, typename) => {
    localStorage.setItem("userId", id);
    this.setState({
      tab,
      selectid: id,
      description: desc,
      typename: typename,
      adserchtxt: "",
      adlevelvalue: "",
      adlevelOp: "",
      subDescription: "",
      deepSubTabDesc: "",
      gatewayTabDesc: "",
      gatewayTankTabDesc: "",
    });
    console.log("typename", typename);
    console.log("description", desc);
    console.log("userid1", id);
  };

  changeSubTabs = (subtab, id, subDesc, typename) => {
    this.setState({
      subtab,
      selectid: id,
      subDescription: subDesc,
      typename: typename,
      adserchtxt: "",
      adlevelvalue: "",
      adlevelOp: "",
      deepSubTabDesc: "",
      gatewayTabDesc: "",
      gatewayTankTabDesc: "",
    });
    console.log("typename", typename);
    console.log("subDescription", subDesc);
  };

  changeDeepSubTabs = (deepsubtab, id, deepsubDesc, typename) => {
    this.setState({
      deepsubtab,
      selectid: id,
      deepSubTabDesc: deepsubDesc,
      typename: typename,
      adserchtxt: "",
      adlevelvalue: "",
      adlevelOp: "",
      gatewayTabDesc: "",
      gatewayTankTabDesc: "",
    });
    console.log("deepSubTabDesc", deepsubDesc);
  };
  changeGatewayTab = (gatewaytab, id, gatewayDesc, typename) => {
    this.setState({
      gatewaytab,
      selectid: id,
      gatewayTabDesc: gatewayDesc,
      typename: typename,
      adserchtxt: "",
      adlevelvalue: "",
      adlevelOp: "",
      gatewayTankTabDesc: "",
    });
  };
  changeGatewayTankTab = (gatewaytanktab, id, gatewaytankDesc, typename) => {
    this.setState({
      gatewaytanktab,
      selectid: id,
      gatewayTankTabDesc: gatewaytankDesc,
      typename: typename,
      adserchtxt: "",
      adlevelvalue: "",
      adlevelOp: "",
    });
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

  render() {
    let { data } = this.props;
    var filterdata = [];
    if (data.loading) {
      return (
        <div>
          <Loader />
        </div>
      );
    }
    if (this.props.data.locationEntry.sublocations.edges.length > 0) {
      console.log(
        "search data",
        this.props.data.locationEntry.sublocations.edges
      );
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
    console.log("selectid", this.state.selectid);
    console.log("desc---", this.state.description);
    console.log("leftTabs", data);
    console.log("SelectedId", this.state.selectid);

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
          />
          {button}
        </div>
        <div className="vertrax_btmSectn">
          <Layout>
            <Sider
              style={{
                overflow: "auto",
                height: "100vh",
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
                <Search
                  saveIcon
                  onChange={(e) => this.searchTextfromleftTab(e.target.value)}
                />
                <div className="tab_wrapper">
                  {filterdata.length > 0 ? (
                    <Fragment>
                      {filterdata.map((item) => (
                        <div>
                          <Tab
                            text={item.node.description}
                            onClick={() =>
                              this.changeTab(
                                item.node.id,
                                item.node.id,
                                item.node.description,
                                item.node.__typename
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
                                    console.log("LocationData", data);
                                    return data.locationEntry.sublocations.edges.map(
                                      (item) => (
                                        <div className="tab_content">
                                          {item.node.__typename ===
                                          "GatewayLocation" ? (
                                            // <div
                                            //   className="leftGateway_desc"
                                            //   // onClick={() =>
                                            //   //   this.changeGateways(
                                            //   //     item.node.id,
                                            //   //     item.node.description
                                            //   //   )
                                            //   // }

                                            // >
                                            //   {item.node.description}
                                            // </div>
                                            <SubTabs
                                              text={item.node.description}
                                              styleName="tab_branch"
                                              onClick={() =>
                                                this.changeSubTabs(
                                                  item.node.id,
                                                  item.node.id,
                                                  item.node.description,
                                                  item.node.__typename
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
                                                  item.node.__typename
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
                                                    console.log(
                                                      "Locationdatainner",
                                                      data
                                                    );
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
                                                                    .__typename
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
                                                                    .__typename
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
                                                                    console.log(
                                                                      "deepsubtab",
                                                                      data
                                                                    );
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
                                                                                    .__typename
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
                                                                                    .__typename
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
                                                                                    console.log(
                                                                                      "gatewayTab",
                                                                                      data
                                                                                    );
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
                                                                                                  .__typename
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
                        {/* <i
                          className="far fa-folder-open"
                          onClick={() => this.toggleCollapse(collapsed)}
                        /> */}

                        {!collapsed ? (
                          <MenuUnfoldOutlined
                            className="app__navTrigger"
                            onClick={() => this.toggleCollapse(collapsed)}
                          />
                        ) : (
                          <MenuFoldOutlined
                            className="app__navTrigger"
                            onClick={() => this.toggleCollapse(collapsed)}
                          />
                        )}

                        {description === description ? (
                          <h3>
                            {description === "" ? "All Clients" : description}
                          </h3>
                        ) : (
                          description
                        )}
                      </div>

                      {subDescription === "" ? (
                        ""
                      ) : (
                        <div className="vertrax_header--all">
                          <RightOutlined
                            style={{ color: "#215CAA", fontSize: "18px" }}
                          />
                          <h4>{subDescription}</h4>
                        </div>
                      )}
                      {deepSubTabDesc === "" ? (
                        ""
                      ) : (
                        <div className="vertrax_header--all">
                          <RightOutlined
                            style={{ color: "#215CAA", fontSize: "18px" }}
                          />
                          <h4>{deepSubTabDesc}</h4>
                        </div>
                      )}
                      {gatewayTabDesc === "" ? (
                        ""
                      ) : (
                        <div className="vertrax_header--all">
                          <RightOutlined
                            style={{ color: "#215CAA", fontSize: "18px" }}
                          />
                          <h4>{gatewayTabDesc}</h4>
                        </div>
                      )}
                      {gatewayTankTabDesc === "" ? (
                        ""
                      ) : (
                        <div className="vertrax_header--all">
                          <RightOutlined
                            style={{ color: "#215CAA", fontSize: "18px" }}
                          />
                          <h4>{gatewayTankTabDesc}</h4>
                        </div>
                      )}
                    </div>
                  ) : (
                    ""
                  )}
                  <div>
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
                      // ghost
                      onClick={this.showForm}
                    >
                      Advanced Search
                    </Button>
                  </div>
                </div>
                <TankTable
                  selectedTankId={this.state.selectid}
                  adSearchValue={this.state.adserchtxt}
                  adLevelValue={this.state.adlevelvalue}
                  adLevelOP={this.state.adlevelOp}
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
          initialvalue={this.state.adserchtxt}
          SavingAdvanceSearch={this.onsavingAdvanceSearch}
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
        // id: props.match.params.id,
      },
    };
  },
})(MainLayout);

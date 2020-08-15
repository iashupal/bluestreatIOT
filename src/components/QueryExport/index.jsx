import React, { useContext, useState } from "react";
import { withApollo } from "react-apollo";
import { saveAs } from "file-saver";
import json2csv from "json2csv";

import "./styles.css";

const LIMIT_PER_CALL = 1000;

function QueryExport(props) {
  const {
    query,
    variables,
    children,
    client,
    formatCSV,
    filename,
    disabledStyleName,
    styleName,
    getPageInfo,
  } = props;

  const [exporting, setExporting] = useState(false);

  async function exportData() {
    if (exporting) return;
    setExporting(true);
    const newVariables = Object.assign({}, variables);
    let after = null;
    let csvData = [];
    try {
      newVariables.first = LIMIT_PER_CALL;
      do {
        newVariables.after = after;
        const { data } = await client.query({ query, variables: newVariables });
        csvData = csvData.concat(formatCSV(data));
        after = getPageInfo(data);
      } while (after);
      const txt = json2csv.parse(csvData);
      //console.log("csvData", txt)

      const blob = new Blob([txt], { type: "text/plain;charset=utf-8" });
      saveAs(blob, filename);
    } catch (e) {
      console.log(e);
    } finally {
      setExporting(false);
    }
  }

  return (
    <div
      className={exporting ? disabledStyleName : styleName}
      onClick={exportData}
    >
      {children}
    </div>
  );
}

export default withApollo(QueryExport);

QueryExport.defaultProps = {
  styleName: "",
  disabledStyleName: "disabledExport",
};

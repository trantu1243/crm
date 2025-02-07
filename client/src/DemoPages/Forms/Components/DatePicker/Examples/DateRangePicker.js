import React, { Fragment } from "react";

import DateTimeRangePicker from "@wojtekmaj/react-datetimerange-picker";


class FormDateRangePicker extends React.Component {
  state = {
    date: [new Date(), new Date()],
  };

  onChange = (date) => {
    if (date) {
      const startDate = new Date(date[0]);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(date[1]);
      endDate.setHours(23, 59, 59, 999); // Giữ đến hết ngày

      this.setState({ date: [startDate, endDate] });
    }
  };

  render() {
    return (
      <Fragment>
        <div>
          <DateTimeRangePicker onChange={this.onChange} value={this.state.date} format="y-MM-dd"/>
        </div>
      </Fragment>
    );
  }
}

export default FormDateRangePicker;

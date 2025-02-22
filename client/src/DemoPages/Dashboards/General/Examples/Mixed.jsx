import React, { Component } from "react";
import Chart from "react-apexcharts";

class Mixed extends Component {
  constructor(props) {
    super(props);

    // Danh sách tháng bằng tiếng Việt (viết tắt)
    const vietMonths = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];

    // Lấy ngày hiện tại
    const today = new Date();
    const currentMonth = today.getMonth(); // Lấy chỉ số tháng (0-11)
    const currentYear = today.getFullYear();

    // Tạo danh sách 30 ngày
    const labels = Array.from({ length: 30 }, (_, i) => {
      let day = i + 1;
      return `${day < 10 ? "0" + day : day} Thg ${vietMonths[currentMonth]}`;
    });

    this.state = {
      optionsMixedChart1: {
        chart: {
          height: 350,
          type: "line",
          toolbar: {
            show: false,
          },
        },
        stroke: {
          width: [0, 4],
        },
        plotOptions: {
          bar: {
            columnWidth: "50%",
          },
        },
        labels: labels, // Gán danh sách ngày với tháng viết tắt
        xaxis: {
          type: "category",
          labels: {
            style: {
              fontSize: "12px",
            },
          },
        },
        
      },
      seriesMixedChart1: [
        {
          name: "Lượt truy cập Web",
          type: "column",
          data: Array.from({ length: 30 }, () => Math.floor(Math.random() * 1000)),
        },
        {
          name: "Tương tác MXH",
          type: "line",
          data: Array.from({ length: 30 }, () => Math.floor(Math.random() * 1000)),
        },
      ],
    };
  }

  render() {
    return (
      <div className="bar">
        <Chart
          options={this.state.optionsMixedChart1}
          series={this.state.seriesMixedChart1}
          type="line"
          width="100%"
          height="355px"
        />
      </div>
    );
  }
}

export default Mixed;

import React, { useState, useEffect } from "react";
import Chart from "react-apexcharts";

const DonutChart = ({ bankStats }) => {
  const [options, setOptions] = useState({
    chart: {
      sparkline: { enabled: false }
    },
    colors: [
      "#008FFB", // xanh
      "#00E396", // xanh lá
      "#FEB019", // vàng
      "#FF4560", // đỏ
      "#775DD0", // tím
      "#F86624", // cam
      "#00E7F9", // xanh nhạt
      "#9C27B0", // tím đậm
      "#FF9800", // cam
    ],
    labels: [], 
    // Tooltip: format giá trị hiển thị cho lát bánh
    tooltip: {
      y: {
        formatter: function (val, opts) {
          const label = opts?.w?.config?.labels[opts.seriesIndex];
          // val là số thực tế, ta format theo dạng 1,000
          return `${new Intl.NumberFormat("en-US").format(val)}`;
        },
      },
    },
    dataLabels: {
      enabled: true,
      // Ở đây ta vẫn hiển thị theo %:
      formatter: (val) => `${val.toFixed(1)}%`,
    },
    legend: {
      position: "right",
      horizontalAlign: 'center',
      // Nếu muốn hiển thị series dạng 1,000 trong legend, có thể thêm formatter:
      formatter: function (label, opts) {
        const seriesVal = opts.w.globals.series[opts.seriesIndex];
        return `${label}: ${new Intl.NumberFormat("en-US").format(seriesVal)} vnd`;
      },
    },
  });

  const [series, setSeries] = useState([]);

  useEffect(() => {
    if (!bankStats) return;

    // Tạo labels = danh sách tên ngân hàng
    const newLabels = bankStats.map((b) => b.bankCode || "Unknown");
    // Tạo series = mảng totalAmount, là số (không format chuỗi)
    const newSeries = bankStats.map((b) => b.totalAmount || 0);

    setOptions((prev) => ({
      ...prev,
      labels: newLabels,
    }));
    setSeries(newSeries);
  }, [bankStats]);

  return (
      <Chart
        options={options}
        series={series}
        type="donut"
        width="100%"
        height="100%"
      />
  );
};

export default DonutChart;

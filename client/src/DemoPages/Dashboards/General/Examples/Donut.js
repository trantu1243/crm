import React, { useState, useEffect } from "react";
import Chart from "react-apexcharts";

const DonutChart = ({ bankStats }) => {
  const [options, setOptions] = useState({
    chart: {
      sparkline: { enabled: false }
    },
    labels: [], // Mảng tên ngân hàng
    tooltip: {
      y: {
        formatter: function (val, opts) {
          if (!opts || !opts.w || !opts.w.config) {
            // Nếu "opts" hoặc "opts.w" chưa sẵn sàng
            return val; // Trả về giá trị gốc
          }
          
          // Ví dụ logic:
          // Lấy bankName = w.config.labels[seriesIndex]
          const label = opts.w.config.labels[opts.seriesIndex];
          return `${label}: ${new Intl.NumberFormat("en-US").format(val)}`;
        },
      },
    },
    // Bật hiển thị % trên lát bánh, kèm theo label
    dataLabels: {
      enabled: true,
      formatter: (val, { seriesIndex, w }) => {
        // val là % lát bánh, seriesIndex là index
        // Lấy bankName
        const label = w.config.labels[seriesIndex];
        return `${label} (${val.toFixed(1)}%)`;
      },
    },
    legend: {
      position: "bottom",
    },
  });

  const [series, setSeries] = useState([]);

  useEffect(() => {
    if (!bankStats) return;

    // Tạo labels = danh sách tên ngân hàng
    // (Có thể kèm totalAmount, nhưng ta sẽ format cẩn thận)
    const newLabels = bankStats.map((b) => b.bankCode || "Unknown");

    // Tạo series = mảng totalAmount
    const newSeries = bankStats.map((b) => b.totalAmount || 0);

    setOptions((prev) => ({
      ...prev,
      labels: newLabels,
    }));

    setSeries(newSeries);
  }, [bankStats]);

  return (
    <div className="apexcharts-donut">
      <Chart
        options={options}
        series={series}
        type="donut"
        width="100%"
      />
    </div>
  );
};

export default DonutChart;

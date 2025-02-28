import React, { useState, useEffect } from "react";
import Chart from "react-apexcharts";

const DonutTransactionsChart = ({ bankStats }) => {

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  const updateScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
  };

  useEffect(() => {
      window.addEventListener("resize", updateScreenSize);

      return () => {
          window.removeEventListener("resize", updateScreenSize);
      };
  }, []);
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
      position: isMobile ? "bottom" : "right",
      horizontalAlign: 'center',
      // Nếu muốn hiển thị series dạng 1,000 trong legend, có thể thêm formatter:
      formatter: function (label, opts) {
        const seriesVal = opts.w.globals.series[opts.seriesIndex];
        return `${label}: ${new Intl.NumberFormat("en-US").format(seriesVal)}`;
      },
    },
    plotOptions: {
      pie: {
        donut: {
          labels: {
            show: true,
            total: {
              show: true,
              label: "",
              formatter: function (w) {
                const total = w.globals.seriesTotals.reduce((a, b) => a + b, 0);
                return `${new Intl.NumberFormat("en-US").format(total)}`;
              },
            }
          }
        }
      }
    }
  });

  useEffect(() => {
    setOptions((prev) => ({
      ...prev,
      legend: {
        ...prev.legend,
        position: isMobile ? "bottom" : "right",
      },
    }));
  }, [isMobile]);

  const [series, setSeries] = useState([]);

  useEffect(() => {
    if (!bankStats) return;

    // Tạo labels = danh sách tên ngân hàng
    const newLabels = Object.entries(bankStats).map(([statusKey, item], index) => item.name || "Unknown");
    // Tạo series = mảng totalTransactions, là số (không format chuỗi)
    const newSeries =Object.entries(bankStats).map(([statusKey, item], index) => item.count || 0);

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

export default DonutTransactionsChart;

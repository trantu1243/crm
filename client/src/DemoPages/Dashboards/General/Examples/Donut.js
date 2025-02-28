import React, { useState, useEffect } from "react";
import Chart from "react-apexcharts";

const DonutChart = ({ bankStats }) => {
  const [series, setSeries] = useState([]);

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
      "#008FFB", "#00E396", "#FEB019", "#FF4560", "#775DD0",
      "#F86624", "#00E7F9", "#9C27B0", "#FF9800",
    ],
    labels: [], 
    tooltip: {
      y: {
        formatter: function (val, opts) {
          return `${new Intl.NumberFormat("en-US").format(val)} vnd`;
        },
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (val) => `${val.toFixed(1)}%`,
    },
    legend: {
      position: isMobile ? "bottom" : "right",
      horizontalAlign: 'center',
      formatter: function (label, opts) {
        const seriesVal = opts.w.globals.series[opts.seriesIndex];
        return `${label}: ${new Intl.NumberFormat("en-US").format(seriesVal)} vnd`;
      },
    },
    plotOptions: {
      pie: {
        donut: {
          labels: {
            show: true,
            value: {
                show: true,
                formatter: function (w) {
                  return `${new Intl.NumberFormat("en-US").format(w)} vnd`;
                },
            },
            total: {
              show: true,
              label: "",
              formatter: function (w) {
                const total = w.globals.seriesTotals.reduce((a, b) => a + b, 0);
                return `${new Intl.NumberFormat("en-US").format(total)} vnd`;
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
  

  useEffect(() => {
    if (!bankStats) return;

    // Tạo labels = danh sách tên ngân hàng
    const newLabels = bankStats.map((b) => b.bankName || "Unknown");
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

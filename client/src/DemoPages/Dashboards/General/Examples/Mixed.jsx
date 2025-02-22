import React, { useState, useEffect } from "react";
import Chart from "react-apexcharts";

const MixedSingleMonth = ({ dailyStats, daysThisMonth = 31 }) => {
  // Số ngày muốn hiển thị
  const maxDays = daysThisMonth;

  // Tạo danh sách ngày: 1..maxDays => ["01","02",...]
  const labels = Array.from({ length: maxDays }, (_, i) => {
    const day = i + 1;
    return day < 10 ? `0${day}` : `${day}`;
  });

  // Cấu hình ApexCharts
  const [options, setOptions] = useState({
    chart: {
      height: 350,
      type: "line",
      zoom: { enabled: false },
      toolbar: {
        show: true,
        tools: {
          zoom: false,
          zoomin: false,
          zoomout: false,
          pan: false,
          reset: false,
        },
      },
    },
    stroke: { width: [0, 4] },
    plotOptions: {
      bar: { columnWidth: "50%" },
    },
    labels: labels,
    xaxis: {
      type: "category",
      labels: {
        style: { fontSize: "12px" },
      },
    },
    yaxis: {
      labels: {
        // Định dạng số có dấu phẩy
        formatter: (val) => new Intl.NumberFormat("en-US").format(val),
      },
    },
    dataLabels: {
      enabled: false,
    },
    tooltip: {
      y: {
        // Khi di chuột lên cột/line, nếu là Fee (seriesIndex=1),
        // ta chia lại cho 100 để hiển thị giá trị thực
        formatter: (val, { seriesIndex }) => {
          if (seriesIndex === 1) {
            return new Intl.NumberFormat("en-US").format(val / 100);
          } else {
            // Amount series => hiển thị nguyên
            return new Intl.NumberFormat("en-US").format(val);
          }
        },
      },
    },
  });

  // 2 series: 
  // 1) "Tháng này (Amount)" => cột
  // 2) "Tháng này (Fee)"    => line, Fee * 100
  const [series, setSeries] = useState([
    {
      name: "Tháng này (Amount)",
      type: "column",
      data: Array(maxDays).fill(0),
    },
    {
      name: "Tháng này (Fee)",
      type: "line",
      data: Array(maxDays).fill(0),
    },
  ]);

  // Mỗi khi dailyStats hoặc daysThisMonth thay đổi => cập nhật biểu đồ
  useEffect(() => {
    if (!dailyStats) return;

    // Tạo mảng cho Amount và Fee (đã scale)
    const amountArray = Array(maxDays).fill(0);
    const feeArray = Array(maxDays).fill(0);

    // Duyệt dailyStats, gán giá trị vào index = day-1
    dailyStats.forEach((item) => {
      // item._id = Ngày (1..31)
      const index = item._id - 1;
      if (index >= 0 && index < maxDays) {
        amountArray[index] = item.totalAmount;
        // Fee x100
        feeArray[index] = item.totalFee * 100;
      }
    });

    setSeries([
      {
        name: "Tiền GD",
        type: "column",
        data: amountArray,
      },
      {
        name: "Phí",
        type: "line",
        data: feeArray,
      },
    ]);
  }, [dailyStats, maxDays]);

  return (
    <div className="bar">
      <Chart options={options} series={series} type="line" width="100%" height="355px" />
    </div>
  );
};

export default MixedSingleMonth;

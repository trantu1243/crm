import React, { useState, useEffect } from "react";
import Chart from "react-apexcharts";

function formatNumber(num) {
    if (num >= 1_000_000_000) {
        return (num / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'B';
    } else if (num >= 1_000_000) {
        return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
    } else if (num >= 1_000) {
        return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
    }
    return num.toString();
}

const MixedSingleMonth = ({ dailyStats, daysThisMonth = 31 }) => {
    const maxDays = daysThisMonth;

    const labels = Array.from({ length: maxDays }, (_, i) => {
        const day = i + 1;
        return day < 10 ? `0${day}` : `${day}`;
    });

    const [options, setOptions] = useState({
        chart: {
            height: 350,
            type: "line",
            zoom: { enabled: false },
            toolbar: {
                show: false,
                tools: {
                    zoom: false,
                    zoomin: false,
                    zoomout: false,
                    pan: false,
                    reset: false,
                },
            },
        },
        stroke: { width: [0, 0, 3] },
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
                formatter: (val) => formatNumber(val),
            },
        },
        dataLabels: {
            enabled: false,
        },
        tooltip: {
            y: {
                formatter: (val, { seriesIndex, dataPointIndex }) => {
                    const item = dailyStats.find((item) => item.day === dataPointIndex + 1);
                    if (seriesIndex === 2) {
                        return new Intl.NumberFormat("en-US").format(val / 100);
                    } else if (seriesIndex === 1) {
                        const str = item ? ` (${item.totalBill})` : " (0)";
                        return new Intl.NumberFormat("en-US").format(val) + str;
                    } else if (seriesIndex === 0) {
                        const str = item ? ` (${item.totalTransactions})` : " (0)";
                        return new Intl.NumberFormat("en-US").format(val) + str;
                    }
                    return new Intl.NumberFormat("en-US").format(val);
                },
            },
        },
    });

    const [series, setSeries] = useState([
        {
            name: "Tháng này (Amount)",
            type: "column",
            data: Array(maxDays).fill(0),
        },
        {
            name: "Tháng này (Bill)",
            type: "column",
            data: Array(maxDays).fill(0),
        },
        {
            name: "Tháng này (Fee)",
            type: "line",
            data: Array(maxDays).fill(0),
        },
    ]);

    useEffect(() => {
        if (!dailyStats) return;

        const amountArray = Array(maxDays).fill(0);
        const billArray = Array(maxDays).fill(0);
        const feeArray = Array(maxDays).fill(0);

        dailyStats.forEach((item) => {
            const index = item.day - 1;
            if (index >= 0 && index < maxDays) {
                amountArray[index] = item.totalAmount;
                billArray[index] = item.totalBillAmount;
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
                name: "Thanh khoản",
                type: "column",
                data: billArray,
            },
            {
                name: "Phí",
                type: "line",
                data: feeArray,
            },
        ]);
        setOptions((prevOptions) => ({
            ...prevOptions,
            tooltip: {
                y: {
                    formatter: (val, { seriesIndex, dataPointIndex }) => {
                        const item = dailyStats.find((item) => item.day === dataPointIndex + 1);
                        if (seriesIndex === 2) {
                            return new Intl.NumberFormat("en-US").format(val / 100);
                        } else if (seriesIndex === 1) {
                            const str = item ? ` (${item.totalBill})` : " (0)";
                            return new Intl.NumberFormat("en-US").format(val) + str;
                        } else if (seriesIndex === 0) {
                            const str = item ? ` (${item.totalTransactions})` : " (0)";
                            return new Intl.NumberFormat("en-US").format(val) + str;
                        }
                        return new Intl.NumberFormat("en-US").format(val);
                    },
                },
            },
        }));
    }, [dailyStats, maxDays]);

    return (
        <div className="bar">
            <Chart options={options} series={series} type="line" width="100%" height="355px" />
        </div>
    );
};

export default MixedSingleMonth;

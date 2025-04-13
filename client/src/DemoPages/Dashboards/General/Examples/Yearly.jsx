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
const maxYears = 9;

const Yearly = ({ yearlyStats, year }) => {

    const labels = Array.from({ length: maxYears }, (_, i) => {
        const value = year + i - 4;
        return value;
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
        stroke: { width: [0, 0, 5] },
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
                    const item = yearlyStats.find((item) => item.year === year + dataPointIndex - 4);
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
            name: "Tiền GDTG",
            type: "column",
            data: Array(maxYears).fill(0),
        },
        {
            name: "Thanh khoản",
            type: "column",
            data: Array(maxYears).fill(0),
        },
        {
            name: "Phí",
            type: "line",
            data: Array(maxYears).fill(0),
        },
    ]);

    useEffect(() => {
        if (!yearlyStats) return;

        const label = Array.from({ length: maxYears }, (_, i) => {
            const value = year + i - 4;
            return value;
        });

        const amountArray = Array(maxYears).fill(0);
        const billArray = Array(maxYears).fill(0);
        const feeArray = Array(maxYears).fill(0);

        yearlyStats.forEach((item) => {
            const index = label.indexOf(item.year);
            if (index >= 0 && index < maxYears) {
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
                ...prevOptions.tooltip,
                y: {
                    formatter: (val, { seriesIndex, dataPointIndex }) => {
                        const item = yearlyStats.find((item) => item.year === year + dataPointIndex - 4);
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
    }, [yearlyStats, year]);

    return (
        <div className="bar">
            <Chart options={options} series={series} type="line" width="100%" height="355px" />
        </div>
    );
};

export default Yearly;

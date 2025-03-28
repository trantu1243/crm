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

const Monthly = ({ monthlyStats }) => {
    const maxMonths = 12;

    const labels = Array.from({ length: maxMonths }, (_, i) => {
        const month = i + 1;
        return month < 10 ? `0${month}` : `${month}`;
    });

    const [options] = useState({
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
                formatter: (val, { seriesIndex }) => {
                    if (seriesIndex === 2) {
                        return new Intl.NumberFormat("en-US").format(val / 100);
                    } else {
                        return new Intl.NumberFormat("en-US").format(val);
                    }
                },
            },
        },
    });

    const [series, setSeries] = useState([
        {
            name: "Tiền GDTG",
            type: "column",
            data: Array(maxMonths).fill(0),
        },
        {
            name: "Thanh khoản",
            type: "column",
            data: Array(maxMonths).fill(0),
        },
        {
            name: "Phí",
            type: "line",
            data: Array(maxMonths).fill(0),
        },
    ]);

    useEffect(() => {
        if (!monthlyStats) return;

        const amountArray = Array(maxMonths).fill(0);
        const billArray = Array(maxMonths).fill(0);
        const feeArray = Array(maxMonths).fill(0);

        monthlyStats.forEach((item) => {
            const index = item.month - 1;
            if (index >= 0 && index < maxMonths) {
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
    }, [monthlyStats, maxMonths]);

    return (
        <div className="bar">
            <Chart options={options} series={series} type="line" width="100%" height="355px" />
        </div>
    );
};

export default Monthly;

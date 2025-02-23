import React from 'react';

const StatusBadge = ({ status }) => {
    let badgeClass = '';
    let badgeText = '';

    switch (status) {
        case 1:
            badgeClass = 'bg-warning';
            badgeText = 'Chưa nhận';
            break;
        case 2:
            badgeClass = 'bg-success';
            badgeText = 'Thành công';
            break;
        case 3:
            badgeClass = 'bg-danger';
            badgeText = 'Hủy';
            break;
        case 6:
            badgeClass = 'bg-secondary';
            badgeText = 'Đã nhận';
            break;
        case 7:
            badgeClass = 'bg-info';
            badgeText = 'Đang xử lý';
            break;
        case 8:
            badgeClass = 'bg-primary';
            badgeText = 'Hoàn thành 1 phần';
            break;
        default:
            badgeClass = 'bg-light';
            badgeText = 'Chưa xác định';
    }

    return (
        <span className={`badge ${badgeClass}`}>{badgeText}</span>
    );
};

export default StatusBadge;

FROM nginx:alpine

# Copy file cấu hình vào thư mục chính xác
COPY nginx.conf /etc/nginx/nginx.conf

# Copy build React vào thư mục phục vụ Nginx
COPY build /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Khởi động Nginx
CMD ["nginx", "-g", "daemon off;"]

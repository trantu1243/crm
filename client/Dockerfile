FROM nginx:alpine

# Copy cấu hình Nginx vào container
COPY nginx.conf /etc/nginx/nginx.conf

# Copy build React vào thư mục phục vụ Nginx
COPY build /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Khởi động Nginx
CMD ["nginx", "-g", "daemon off;"]
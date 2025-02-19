FROM ubuntu:latest
LABEL authors="micer"

ENTRYPOINT ["top", "-b"]

# 使用官方的Nginx镜像作为基础镜像
FROM nginx:alpine

#删除默认的Nginx配置文件
RUN rm -rf /usr/share/nginx/html/*

#将构建的静态文件复制到Nginx的html目录
COPY ./dist /usr/share/nginx/html


#复制自定义的Nginx配置文件

#COPY nginx.conf /etc/nginx/conf.d/default.conf


#暴露Nginx的默认端口

EXPOSE 80


#启动Nginx

CMD ["nginx", "-g", "daemon off;"]

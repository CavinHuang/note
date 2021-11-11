# Dockerfile
FROM node

# 将 dist 文件中的内容复制到 /usr/share/nginx/html/ 这个目录下面
# 所以，之前必须执行 npm run build 来打包出 dist 目录，重要！！！
WORKDIR /app
# #RUN npm install

COPY . /app

COPY package*.josn ./app

<<<<<<< HEAD
RUN npm install --registry=https://registry.npmmirror.com

=======
RUN npm install
>>>>>>> 99e343972ef51dbd50cb567f02ab96c78fd45cf8
# 拷贝 nginx 配置文件
# COPY nginx.conf /etc/nginx/nginx.conf

# 设置时区
RUN ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime && echo 'Asia/Shanghai' >/etc/timezone

# 创建 /admin-fe-access.log ，对应到 nginx.conf
#CMD touch /cavinHuang-note-access.log && nginx && tail -f /cavinHuang-note-access.log
EXPOSE 5000

CMD npm run docs:serve

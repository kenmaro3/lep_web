docker stop $(docker ps -aq) && docker rm $(docker ps -aq) && \
cd api && docker build -t api .
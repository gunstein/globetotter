#Build Stage Start

#Specify a base image
FROM node:alpine as builder 

#Specify a working directory
WORKDIR '/app'

#Copy the dependencies file
COPY package.json .

#Install dependencies
RUN npm install

#Copy remaining files
COPY . .

ARG REACT_APP_GRAPHQL_URL

ENV REACT_APP_GRAPHQL_URL $REACT_APP_GRAPHQL_URL

#Build the project for production
RUN npm run build 

#Run Stage Start
FROM nginx

#Change content of default.conf
RUN rm -rf /etc/nginx/conf.d
COPY conf /etc/nginx

#Copy production build files from builder phase to nginx
COPY --from=builder /app/build /usr/share/nginx/html

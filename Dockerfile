FROM node:18.12.0-lts
WORKDIR /timesheet-fe
ENV PATH /timesheet-fe/node_modules/.bin:$PATH

# pull official base image
FROM node:18.12.0-lts

# set working directory
WORKDIR /timesheet-fe

# add `/app/node_modules/.bin` to $PATH
ENV PATH /timesheet-fe/node_modules/.bin:$PATH

# install app dependencies
COPY package.json ./
COPY yarn.lock ./
RUN yarn add

COPY . ./

RUN yarn build

FROM nginx:stable-alpine

COPY --from=dist /timesheet/dist /usr/share/nginx/html

EXPOSE 3000

# add app
COPY . ./

# start app
RUN yarn build

# production environment
FROM nginx:stable-alpine
COPY --from=build /timesheet/dist /usr/share/nginx/html
EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
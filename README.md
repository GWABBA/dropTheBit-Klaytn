# ec2 installing docker
sudo yum -y install docker
sudo service docker start
sudo usermod -aG docker ec2-user
# installing docker-compose
sudo curl -L https://github.com/docker/compose/releases/download/1.21.0/docker-compose-`uname -s`-`uname -m` | sudo tee /usr/local/bin/docker-compose > /dev/null
sudo chmod +x /usr/local/bin/docker-compose
sudo ln -s /usr/local/bin/docker-compose /usr/bin/docker-compose
docker-compose --version
sudo reboot now

# connecting to the server:
- in $HOME/.ssh, touch config file and add the lines below:
Host DropTheBitServer
  HostName ec2-52-79-228-16.ap-northeast-2.compute.amazonaws.com
  User ec2-user
  IdentityFile ~/.ssh/gwabba_aws.pem

# Client dockerization
# Update TheCampainLinkLists.vue (importing directory)
# Update NewCampaignForm.vue (importing directory)
# buiding docker:
cd client
docker build -t dtb/client .
docker run -t -p 8089:80 --name client dtb/client:latest
# tagging image
docker image tag <IMAGE ID> dtb/client:latest

# Sever dockerization
# for docker nodejs : .env file mongo db conection
MONGO_URI=mongodb://host.docker.internal:27017/ 
# for nodejs : .env file mongo db conection
MONGO_URI=mongodb://localhost:27017/
# buiding docker:
docker build -t dtb/server .
<!-- docker run -t -p 9000:9000 server:latest -->
docker run -t -p 9000:9000 --name server dtb/server:latest
# tagging image
docker image tag <IMAGE ID> dtb/server:latest

# mongo-docker connection
docker pull mongo:latest
mkdir mongo
cd mongo
docker run -d -p 2717:27017 -v /home/ec2-user/mongo:/data/db --name mongo mongo:latest
docker exec -it  mongo bash
mongo
show dbs
use test
db.user.insert({name: "Ada Lovelace", age: 205})
show dbs

# docker pull descriptions
aws ecr describe-repositories
aws ecr describe-images --repository-name dtb/client
aws ecr describe-images --repository-name dtb/server

# docker pull client

# MEVN Stack

A Quickstart template for building a fullstack using:
- [Node](https://nodejs.org/)
- [Express](http://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [VueJS](https://vuejs.org/)
  - [Vuetify](https://vuetifyjs.com/) as a Vue Component Framework

The application consists of an Express REST API that is consumed by a VueJS Single Page Application.

## Installation

This repository can be used via cloning the code base or copying it as a GitHub template. The process is identical excluding the first step:s

```sh
# clone this repository
git clone git@github.com:aturingmachine/mevn-stack.git [directory-name]

# or click "use this template" and clone your new repo
git clone <your-repo>

# run the setup script
npm run setup

# if the setup script fails:
# install dependencies in both sub-projects
npm ci
npm ci --prefix client/

# copy env file
cp .env.example .env
```

### Other Dependencies

You will also need:
  - A MongoDB instance to connect to
  - The [Vue CLI](https://cli.vuejs.org/) installed

## Development

This repo comes with a helper script to run both the Vue development server and Express application in the same terminal:

```sh
npm run dev
```

Either application can also be run individually:

```sh
# Start the Express application with reloading via nodemon
npm run dev:server

# Start the Vue application with HMR and Reloading
npm run dev:client
```

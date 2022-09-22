# Update TheCampainLinkLists.vue (importing directory)
# Update NewCampaignForm.vue (importing directory)
# client
# buiding docker:
docker build -t client .
docker run -t -p 8089:80 --name vuec client:latest

# update the server port in src/middleware/cors.js
- res.header('Access-Control-Allow-Origin', 'http://3.39.148.171:80')


## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Run your unit tests
```
npm run test:unit
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

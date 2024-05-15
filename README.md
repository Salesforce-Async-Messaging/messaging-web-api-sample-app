# Salesforce Messaging for Web API Sample App
# Team: Embedded Service for Web

A repository holding a sample app created using React JS library to demonstrate Messaging for Web using SCRT2 Public (aka v2.0) REST APIs.

## REST API Documentation

TODO

## Installation
This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

### Clone this repo
```
$ git clone https://github.com/Salesforce-Async-Messaging/messaging-web-api-sample-app.git
```

### Install build dependencies
```
$ cd messaging-web-api-sample-app
$ npm run build
```
Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

## Launch Application
```
$ npm start
```
Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### Configure Embedded Messaging deployment
When the app is running, go to [http://localhost:3000](http://localhost:3000).
These values are available under the Code Snippet panel in the Embedded Messaging deployment setup in Salesforce.

## Mirroring the repository (internal use only)
```
$ git clone --mirror https://git.soma.salesforce.com/embedded-service-for-web/messagingforweb-sample-app.git

cd messagingforweb-sample-app
git remote set-url --push origin https://github.com/Salesforce-Async-Messaging/messaging-web-api-sample-app

git fetch -p origin
git push --mirror
```
For more details, see documentation on [mirroring a repository in another location](https://docs.github.com/en/repositories/creating-and-managing-repositories/duplicating-a-repository#mirroring-a-repository-in-another-location).
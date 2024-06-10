# Salesforce Messaging for Web API Sample App

A repository holding a sample app created using React JS library to demonstrate the Messaging experience using Messaging for In-App and Web Public (aka v2.0) REST APIs.

## REST API Documentation
[https://developer.salesforce.com/docs/service/messaging-api](https://developer.salesforce.com/docs/service/messaging-api)

## Prerequisites
Ensure you have an Embedded Service deployment for Messaging for In-App and Web created of type Custom Client.

## Launch Application Remotely
Go to [https://git.soma.salesforce.com/pages/embedded-service-for-web/messagingforweb-sample-app/build/index.html](https://git.soma.salesforce.com/pages/embedded-service-for-web/messagingforweb-sample-app/build/index.html)

## Local Development and Testing Setup
This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).
For issues with the sample app, please contact Salesforce Support.

### Local Environment requirements
For local app development and testing, make sure you have `npm` or `yarn` installed.

### Installation
#### Clone this repo
```
$ git clone https://github.com/Salesforce-Async-Messaging/messaging-web-api-sample-app.git
```

#### Install build dependencies
```
$ cd messaging-web-api-sample-app
$ npm install
$ npm run build
```
Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.
The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!
See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

#### Launch Application from Local Setup
```
$ npm start
```
- Runs the app in the development mode.\
- The page will reload when you make changes.\
- You may also see any lint errors in the console.
- [Local Testing Only] - Disable Strict Mode in the React App by going to `src/index.js` and comment out `React.StrictMode` encapsulating the `<App />`
- After the app is running, open [http://localhost:3000](http://localhost:3000) in your browser to get started.

## Test Sample App
- Once the Sample App page is launched either Remotely or via Local Setup, input your Embedded Service deployment details in the form and submit.
  - The deployment details can be found under the Code Snippet panel under Embedded Service deployment setup in Salesforce.
- Click on the 'Let's Chat' Button to get started with a new conversation.

## Mirroring the repository (for internal use only)
[Internal Repo](https://git.soma.salesforce.com/embedded-service-for-web/messagingforweb-sample-app)
[Public Repo (Mirror)](https://github.com/Salesforce-Async-Messaging/messaging-web-api-sample-app)
```
$ git clone --mirror https://git.soma.salesforce.com/embedded-service-for-web/messagingforweb-sample-app.git

$ cd messagingforweb-sample-app
$ git remote set-url --push origin https://github.com/Salesforce-Async-Messaging/messaging-web-api-sample-app

$ git fetch -p origin
$ git push --mirror
```
For more details, see documentation on [mirroring a repository in another location](https://docs.github.com/en/repositories/creating-and-managing-repositories/duplicating-a-repository#mirroring-a-repository-in-another-location).
# React Compare App

This is a web application that allows users to create, view, and share comparison tables. Users can define templates with custom fields and then create comparisons based on those templates. It's built using React, Vite, and Firebase.

## Features

*   User authentication (Sign up, Login)
*   Create custom comparison templates
*   Create comparison tables based on templates
*   Add items with details to comparison tables
*   View and compare items in a table format
*   Comment on comparisons

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

*   [Node.js](https://nodejs.org/) (v18 or later recommended)
*   npm (comes with Node.js)

### Installation

1.  Clone the repository:
    ```sh
    git clone https://github.com/britsie1/compare-stuff.git
    ```
2.  Navigate to the project directory:
    ```sh
    cd react-compare-app
    ```
3.  Install the dependencies:
    ```sh
    npm install
    ```

### Configuration

The project uses Firebase for backend services like authentication and database. You need to set up your own Firebase project to get the configuration credentials.

1.  Go to the [Firebase Console](https://console.firebase.google.com/).
2.  Create a new project.
3.  In your project, go to Project Settings and add a new web app.
4.  You will be given a `firebaseConfig` object.
5.  Create a file `src/config/firebaseConfig.js` and add your configuration like this:

    ```javascript
    // src/config/firebaseConfig.js
    export const firebaseConfig = {
      apiKey: "YOUR_API_KEY",
      authDomain: "YOUR_AUTH_DOMAIN",
      projectId: "YOUR_PROJECT_ID",
      storageBucket: "YOUR_STORAGE_BUCKET",
      messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
      appId: "YOUR_APP_ID"
    };
    ```

### Running the Application

*   To run the app in development mode:
    ```sh
    npm run dev
    ```
    This will start the Vite development server, and you can view the application at `http://localhost:5173`.

*   To build the app for production:
    ```sh
    npm run build
    ```
    This will create a `dist` folder with the production-ready files.

*   To run the tests:
    ```sh
    npm run test
    ```
    This will run the tests using Jest.

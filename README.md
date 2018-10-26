# React Dashboard


React-dashboard is a dashboarding application that enables building dashboard and templates.
It mainly supports **Application Insights** but data sources and visual components are easily extendable.

## Changes

### Version 1.3

Version 1.3 contains the following changes:

* Moving application insights queries from client to server
* Updated tests to answer some security risks presented by GitHub
* Updated tests to accommodate the new approach
* Added masking/unmasking of connection parameters (so that client side can only update API KEY but not see what it is)
* Fixed small bugs with Firefox rendering

### Version 1.2
Version 1.2 breaks the persitency paths of dashboard files and custom templates. If you are upgrading to this version, copy your private dashboards from `/dashboards` into `/dashboards/persistent/` as follows: 

> Private Files: Move files from `/dashboards/*.private.js` to `/dashboards/persistent/private`.

> Custom Templates: Move files from `/dashboards/customTemplates/*.private.ts` to `/dashboards/persistent/customTemplates`.

# Preview

[![Preview](/docs/images/bot-fmk-dashboard.png)](/docs/images/bot-fmk-dashboard.png)
[![Preview](/docs/images/bot-fmk-dashboard-msgs.png)](/docs/images/bot-fmk-dashboard-msgs.png)
[![Preview](/docs/images/bot-fmk-dashboard-intent.png)](/docs/images/bot-fmk-dashboard-intent.png)

# Installation

```bash
npm install yarn -g

git clone https://github.com/webdevstar/React-dashboard
cd React-dashboard
yarn
yarn start
```

### Using Bot Analytics Instrumented Dashboard

1. Open **http://localhost:4000**
2. Create a new template from **Bot Analytics Instrumented Dashboard**
3. Run through the **Application Insights** setup and fill in **API Key** and **Application ID** according to the application insights account associated with your registered bot.


### Installation on Ubuntu

Use the following to install yarn on Ubuntu:

```bash
curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
sudo apt-get update && sudo apt-get install yarn
```

# Development

```bash
yarn start:dev
```

Open **http://localhost:3000**

For contribution and code documentation follow:
[DEVELOPMENT & CONTRIBUTION](/docs/README.md).

# Build
Our CI server Travis creates new production builds automatically for changes
to master. If you need to create a build locally, you can execute the same
commands as the CI server.

```bash
yarn build
```

Or

```bash
.travis/build.sh
```

# Resources

### Technologies In Use

* https://facebook.github.io/react/
* https://github.com/facebookincubator/create-react-app
* http://recharts.org/
* https://react-md.mlaursen.com/

### Design and Patterns
This project is built using:

* https://github.com/facebookincubator/create-react-app

The server approach was added using:

* https://www.fullstackreact.com/articles/using-create-react-app-with-a-server/

Thinking about integrating with:

* https://github.com/facebookincubator/create-react-app/blob/master/packages/react-scripts/template/README.md


### Engines

* Running node version 6.11 or above. 

# License
MIT

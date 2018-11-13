import * as React from 'react';

import ConfigDashboard from '../components/ConfigDashboard';

import ConfigurationsActions from '../actions/ConfigurationsActions';
import ConfigurationsStore from '../stores/ConfigurationsStore';

interface IDashboardState {
  dashboard?: IDashboardConfig;
  connections?: IConnections;
  connectionsMissing?: boolean;
}

export default class Config extends React.Component<any, IDashboardState> {

  state: IDashboardState = {
    dashboard: null,
    connections: {},
    connectionsMissing: false
  };

  constructor(props: any) {
    super(props);

    //ConfigurationsActions.loadConfiguration();
  }

  componentDidMount() {

    this.setState(ConfigurationsStore.getState());

    ConfigurationsStore.listen(state => {
      this.setState(ConfigurationsStore.getState());
    });
  }

  render() {

    var { dashboard, connections } = this.state;

    if (!dashboard) {
      return null;
    }

    return (
      <ConfigDashboard dashboard={dashboard} connections={connections} />
    );
  }
}

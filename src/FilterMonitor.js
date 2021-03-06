import { cloneElement, Component } from 'react';
import PropTypes from 'prop-types';
import mapValues from 'lodash/mapValues';
import reducer from './reducers';

export default class FilterMonitor extends Component {
  static update = reducer;

  static propTypes = {
    children: PropTypes.element,
    whitelist: PropTypes.array,
    blacklist: PropTypes.array
  };

  isNotFiltered(actionType) {
    const type = actionType || '';
    return (
      this.props.whitelist && type.match(this.props.whitelist.join('|')) ||
      this.props.blacklist && !type.match(this.props.blacklist.join('|'))
    );
  }

  render() {
    let {
        whitelist, blacklist, actionsFilter, statesFilter,
        monitorState, children, actionsById, stagedActionIds, computedStates,
        ...rest
      } = this.props;
    let filteredStagedActionIds = [];
    let filteredComputedStates = [];
    let filteredActionsById = {};

    if (whitelist || blacklist) {
      stagedActionIds.forEach((id, idx) => {
        if (this.isNotFiltered(actionsById[id].action.type)) {
          filteredStagedActionIds.push(id);
          filteredComputedStates.push(
            statesFilter ?
            { ...computedStates[idx], state: statesFilter(computedStates[idx].state, idx) } :
            computedStates[idx]
          );
          filteredActionsById[id] = (
            actionsFilter ?
              { ...actionsById[id], action: actionsFilter(actionsById[id].action, id) } :
              actionsById[id]
          );
        }
      });

      rest = {
        ...rest,
        actionsById: filteredActionsById,
        stagedActionIds: filteredStagedActionIds,
        computedStates: filteredComputedStates
      };
    } else {
      if (actionsFilter) {
        filteredActionsById = mapValues(actionsById, (action, id) => (
          { ...action, action: actionsFilter(action.action, id) }
        ));
      } else filteredActionsById = actionsById;

      if (statesFilter) {
        filteredComputedStates = computedStates.map((state, idx) => (
          { ...state, state: statesFilter(state.state, idx) }
        ));
      } else filteredComputedStates = computedStates;

      rest = {
        ...rest,
        stagedActionIds,
        actionsById: filteredActionsById,
        computedStates: filteredComputedStates
      };
    }

    const childProps = {
      ...rest,
      monitorState: monitorState.childMonitorState || {}
    };
    return cloneElement(children, childProps);
  }
}

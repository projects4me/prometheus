import ApplicationAdapter from './application';

/**
 * The issue adapter
 *
 * @class IssueAdapter
 * @namespace Prometheus.Adapters
 * @extends ApplicationAdapter
 * @author Rana Nouman <ranamnouman@gmail.com>
 */
export default class IssueAdapter extends ApplicationAdapter {
    /**
     * This function is called when an exisiting record is updated (PATCH). By default on PATCH call, ember data sends attributes
     * to the server which are not even updated. We are overriding this function in order to just add updated attributes
     * of a model to request payload.
     * 
     * @param {*} store 
     * @param {*} schema 
     * @param {*} snapshot 
     * @returns 
     */
    updateRecord(store, schema, snapshot) {    
        let changedAttributes = snapshot.changedAttributes();
        let moreUpdatedAttributes = {};
        if (changedAttributes.status
            && changedAttributes.status[0] === 'done' //old value
            && changedAttributes.status[1] !== 'done' //new value
        ) {
            moreUpdatedAttributes.isReopened= 1;
        }
        return super.updateRecord(store, schema, snapshot, moreUpdatedAttributes);
    }
}

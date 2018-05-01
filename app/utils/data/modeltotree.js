/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

/**
 * This utility class is used to convert model objects to tree
 *
 * @class Modeltotree
 * @namespace Prometheus.Utils
 * @module Data
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default {

    /**
     * This function converts model to tree
     *
     * @method modelToTree
     * @param {Prometheus.Models.Object} model The model that needs to be converted
     * @return {Object} tree The tree structure for the object
     * @todo be able to convert most of the trees
     */
    modelToTree:function(model){
        let tree = {};
        Logger.debug('The model received is');
        Logger.debug(model);

        let length = model.get('length');
        let node = null;
        let temp = {};

        // Convert the model to flat object
        for (let i=0;i<length;i++)
        {
            node = model.objectAt(i);
            temp[node.get('id')] = {id:node.get('id'),name:node.get('name')};
            if (!(node.get('parentId') === '' || node.get('parentId') === undefined || node.get('parentId') === null))
            {
                temp[node.get('id')]['parentId'] = node.get('parentId');
            }
        }

        // un-flatten the object to get nodes
        tree = this.unflatten(temp);
        return tree;
    },

    /**
     * Inspired from http://stackoverflow.com/questions/18017869/build-tree-array-from-flat-array-in-javascript#answer-31247960
     * @method unflatten
     * @example
     * var obj = {
     *  "1":{ "id":"1", "name":"Home" },
     *  "2":{ "id":"2", "name":"Awesome", "parentId":"3" },
     *  "4":{ "id":"4", "name":"Entities" },
     *  "5":{ "id":"5", "name":"Mass income" },
     *  "3":{ "id":"3", "name":"Project", "parentId":"4"  },
     *  "6":{ "id":"6", "name":"Surely this time" },
     *  "7":{ "id":"7", "name":"Test update take 3" },
     *  "8":{ "id":"8", "name":"Welcome to our World" }
     * };
     * result = this.unflatten(obj);
     * {
     *   "1":{
     *     "id":"1",
     *     "name":"Home",
     *     "nodes":{}
     *   },
     *   "4":{
     *     "id":"4",
     *     "name":"Entities",
     *     "nodes":{
     *       "3":{
     *         "id":"3",
     *         "name":"Project",
     *         "parentId":"4",
     *         "nodes":{
     *           "2":{
     *             "id":"2",
     *             "name":"Awesome",
     *             "parentId":"3",
     *             "nodes":{}
     *           }
     *         }
     *       }
     *     }
     *   },
     *   "5":{
     *     "id":"5",
     *     "name":"Mass income",
     *     "nodes":{}
     *   },
     *   "6":{
     *     "id":"6",
     *     "name":"Surely this time",
     *     "nodes":{}
     *   },
     *   "7":{
     *     "id":"7",
     *     "name":"Test update take 3",
     *     "nodes":{}
     *   },
     *   "8":{
     *     "id":"8",
     *     "name":"Welcome to our World",
     *     "nodes":{}
     *   }
     * }
     * @param {Prometheus.Models.Object} model The model that needs to be converted
     * @return {Object} tree The tree structure for the object
     * @public
     */
    unflatten : function( obj ){
        let tree = {},
            mappedArr = {},
            arrElem,
            mappedElem;

        // First map the nodes of the array to an object -> create a hash table.
        for(let i in obj) {
            arrElem = obj[i];
            mappedArr[arrElem['id']] = arrElem;
            mappedArr[arrElem['id']]['nodes'] = {};
        }

        for (let id in mappedArr) {
            if (mappedArr.hasOwnProperty(id)) {
                mappedElem = mappedArr[id];
                // If the element is not at the root level, add it to its parent array of children.
                if (mappedElem.parentId) {
                    mappedArr[mappedElem['parentId']]['nodes'][mappedElem.id ] = mappedElem;
                }
                // If the element is at the root level, add it to first level elements array.
                else {
                    //tree.push(mappedElem);
                    tree[mappedElem.id] = mappedElem;
                }
            }
        }
        return tree;
    },

    /**
     * This function find a node in the tree for us
     *
     * @method findNode
     * @param {String} id this id we need to locate in the tree
     * @param {Object} node the node in the tree we need to examine
     * @public
     */
    findNode:function(id,node){
        // Traverse through the node
        for(let nodeId in node){
            // If the node is available at the current level then return it
            if (nodeId === id)
            {
                return node[id];
            }
            // otherwise look into the next level
            else if (node[nodeId]['nodes'] !== undefined)
            {
                // Unfortunately the length property is not available in the EmptyObject
                // so we have to check it.
                let result = this.findNode(id,node[nodeId]['nodes']);
                if (result)
                {
                    return result;
                }
            }
        }
        return false;
    },

    /**
     * This function find the parent of the node requested
     *
     * @method findParent
     * @param {String} id  this id we need to locate in the tree
     * @param {Object} node the node in the tree we need to examine
     * @public
     */
    findParent:function(id,node){
        // Traverse through the node
        for(let nodeId in node){
            // If the node is available at the current level then return it
            if (node[nodeId]['nodes'] !== undefined)
            {
                if (node[nodeId]['nodes'][id] !== undefined)
                {
                    return node[nodeId];
                }
                else {
                    // Unfortunately the length property is not available in the EmptyObject
                    // so we have to check it.
                    let result = this.findParent(id,node[nodeId]['nodes']);
                    if (result)
                    {
                        return result;
                    }
                }
            }
        }
        return false;
    }

};
/* Licensing : http://legal.projects4.me/LICENSE.txt, please don't remove :) */
//import Ember from "ember";
import Page from "../wiki/page";

/**
  The wiki's edit page route. This route retrieves the information and displays
  it across.

  @class AppProjectWikiEdit
  @extends Page
*/
export default Page.extend({

  /**
    This function retrieves the route parameters, Most of the wiki functionality
    is simialar so we one write it once and extends it for different routes.
    In order to make sure that we are able to retreive the correct paramerts we
    have exposed this function.
    @method getParams
    @returns params {Object} The parameters for this route
    @private
  */
  getParams:function(){
    var params = {};
    params['projectId'] = this.paramsFor('app.project').projectId;
    params['wikiName'] = this.paramsFor('app.project.wiki.edit').wikiName;
    return params;
  }

});

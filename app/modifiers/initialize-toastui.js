/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { modifier } from 'ember-modifier';
import Editor from '@toast-ui/editor';
import Tribute from "tributejs";

//This function initialize toastui editor's object.
export default modifier(function initializeToastui(element,[usersList, issuesList]) {
  // Initializing tribute object
  let tribute = new Tribute({
    collection: [{
      trigger: '@',
      values: usersList,
      // template for showing list of items in menu
      menuItemTemplate: function (item) {
        return (
          '<a href="/app/user/' +
          item.original.value +
          '">' +
          item.original.label +
          "</a>"
        );
      },
      //template appears on selection of an list item
      selectTemplate: function (item) {
        return (
          '<span contenteditable="false"><a href="/app/user/' +
          item.original.value +
          '">' +
          item.original.label +
          "</a></span>"
        );
      },
      //if we want to match multiple trigger keys, this attribute should be false
      autocompleteMode: false
    }, {
      trigger: '#',
      values: issuesList,
      menuItemTemplate: function (item) {
        return (
          '<a href="/app/user/' +
          item.original.number +
          '">' +
          item.original.number + '-' + item.original.name +
          "</a>"
        );
      },
      selectTemplate: function (item) {
        return (
          '<span contenteditable="false"><a href="/app/' +
          item.original.projectId + '/issues/'+ item.original.number+
          '">' +
          item.original.number + '-' + item.original.name +
          "</a></span>"
        );
      },
      lookup: 'number',
      autocompleteMode: false,
      menuItemLimit: 5
    }
    ]
  });
  
  //Creating Editor object of toastui 
  const editor = new Editor({
    el: element,
    height: '600px',
    previewStyle: 'vertical'
  });

  //Getting element in order to attach tribute to it
  let targetElement = document.querySelector('div.tui-editor-contents.tui-editor-contents-placeholder');
  tribute.attach(targetElement);

  //Adding an event on opening of menu and after that appyling style and class on 'ul'
  targetElement.addEventListener("tribute-active-true", function(e) {
    let listElement = document.querySelector('div.tribute-container > ul');
    listElement.style.display="block";
    listElement.classList.add('dropdown-menu');
  });
  
  //Removing tribute from element
  return () => {
    tribute.detach(targetElement);
};
});

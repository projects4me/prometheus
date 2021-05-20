/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { modifier } from 'ember-modifier';
import Editor from '@toast-ui/editor';
import Tribute from "tributejs";
import format from "prometheus/utils/data/format";
import Icon from "prometheus/utils/ui/priority-icon";

//This function initialize toastui editor's object.
export default modifier(function initializeToastui(element,[usersList, issueSearch, emojiList]) {

  // Initializing tribute object
  // let tribute = new Tribute({
  //   collection: [{
  //     trigger: '@',
  //     values: usersList,
  //     // template for showing list of items in menu
  //     menuItemTemplate: function (item) {
  //       return (
  //         '<a href="/app/user/' +
  //         item.original.value +
  //         '">' +
  //         item.original.label +
  //         "</a>"
  //       );
  //     },
  //     //template appears on selection of an list item
  //     selectTemplate: function (item) {
  //       return (
  //         '<span contenteditable="false" id="@"><a class="badge" href="/app/user/' +
  //         item.original.value +
  //         '">@' +
  //         item.original.label +
  //         "</a></span>"
  //       );
  //     },
  //     //if we want to match multiple trigger keys, this attribute should be false
  //   }, {
  //     trigger: '#',
  //     values: function (text,cb) {
  //       remoteSearch(text,cb);
  //     },
  //     menuItemTemplate: function (item) {
  //       return (
  //         '<a href="/app/project/' +
  //         item.original.projectId + '/issue/'+ item.original.number+
  //         '">' +
  //         item.original.number + '-' + item.original.name +
  //         "</a>"
  //       );
  //     },
  //     selectTemplate: function (item) {
  //       let icon = new Icon();
  //       let iconClass=  icon.getClass(item.original.priority);
  //       return (
  //         '<span class="issue" contenteditable="false" id="#"><a class="'+item.original.status+' badge"href="/app/project/' +
  //         item.original.projectId + '/issue/'+ item.original.number+
  //         '"><i class="fa '+iconClass+'"></i> #' +
  //         item.original.number + ' - ' + item.original.name +
  //         "</a></span>"
  //       );
  //     },
  //     lookup: 'number',
  //   }, {
  //     trigger: ':',
  //     values: emojiList,
  //     menuItemTemplate: function (item) {
  //       return (
  //         '<a style="cursor:pointer"><i class="twa twa-'+item.original.name+'"></i>'+item.original.name +"</a>"
  //       );
  //     },
  //     selectTemplate: function (item) {
  //       return (
  //         '<i class="twa twa-'+item.original.name+'"></i>'
  //       );
  //     },
  //     menuItemLimit: 5,
  //     lookup:'name',
  //   }
  //   ]
  // });

  //Creating Editor object of toastui 
  const editor = new Editor({
    el: element,
    height: '600px',
    previewStyle: 'vertical',
    initialEditType: 'wysiwyg',
    initialValue: '<p>&#128518;</p>',
    events: {
      load: () => {
        $('div.tui-editor-contents.tui-editor-contents-placeholder')
        .atwho({
        at: ':',
        displayTpl: "<li><i class='twa twa-${name}'></i> ${name} </li>",
        insertTpl: "<i class='twa twa-${name}'></i>",
        data: emojiList
    });
      }
    },
    useDefaultHTMLSanitizer: false
  });
  editor.setHtml('<i class="test"></i>');
  // editor.setHtml('<i>&#128512;</i>');
  // editor.setHtml('<a href="https://www.google.com">Google</a>');
  // editor.getSquire().insertHTML('<a href="https://www.w3schools.com">Visit W3Schools.com!</a>');
  
  // function remoteSearch(text,cb) {
  //   var result = issueSearch(text);
  //   let map = {
  //     id:'id',
  //     name:'subject',
  //     number:'issueNumber',
  //     status:'status',
  //     projectId:'projectId',
  //     priority:'priority'
  // };
  //   result.then(function(data){
  //     cb(format.getSelectList(data, map));
  //   });
  // }
  // //Getting element in order to attach tribute to it
  // let targetElement = document.querySelector('div.tui-editor-contents.tui-editor-contents-placeholder');
  // tribute.attach(targetElement);

  // //Adding an event on opening of menu and after that appyling style and class on 'ul'
  // targetElement.addEventListener("tribute-active-true", function(e) {
  //   let listElement = document.querySelectorAll('div.tribute-container > ul');
  //   listElement[0].style.display="block";
  //   listElement[0].classList.add('dropdown-menu');
  //   setTimeout(function() {
  //     $(listElement).find('li.highlight').addClass('curr');
  //   },580);
  //   targetElement.addEventListener('keydown',keyboardEvent);
  //   listElement[0].addEventListener('mouseenter',mouseEvent)
  //   editor.on("keydown",testFunc);
  // });
  // function testFunc(e) {
  //     if(e.data.keyCode == 13) {
  //       debugger;
  //     }
  // }
  // function keyboardEvent(e) {
  //   let listElement = document.querySelectorAll('div.tribute-container > ul');
  //   debugger;
  //   let li = $(listElement).find('li.curr').removeClass('curr');
  //   if(e.keyCode==40) {
  //     if($(li).is(':last-child')) {
  //       $(listElement).find('li:first-child').addClass('curr');
  //     } else {
  //     $(li).next().addClass('curr');
  //     }
  //   } else if (e.keyCode==38) {
  //     if($(li).is(':first-child')) {
  //       $(listElement).find('li:last-child').addClass('curr');
  //     } else {
  //     $(li).prev().addClass('curr');
  //     }
  //   } else if (e.keyCode==13) {
  //     window.getSelection().empty();
  //     editor.getSquire().undo();
  //     // console.log($(listElement).find('li.curr'));
  //     // // $(listElement).onclick(function() {
  //     // //   alert('123');
  //     // // });
  //   }
  // }
//   function mouseEvent(e) {
//     let listElement = document.querySelectorAll('div.tribute-container > ul');
//     let li = $(listElement).find('li.curr').removeClass('curr');
//     console.log('mouseenter');
//   }
//   targetElement.addEventListener("tribute-active-false",function (e) {
//     console.log('menu closed!');
//     targetElement.removeEventListener('keydown',keyboardEvent);
//     targetElement.removeEventListener('mouseenter',mouseEvent);
//     editor.off('keydown',testFunc);
//   });
  
//   //Removing tribute from element
//   return () => {
//     tribute.detach(targetElement);
// };
});

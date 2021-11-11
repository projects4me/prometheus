/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Modifier from 'ember-modifier';
import Editor from '@toast-ui/editor';
import Tribute from "tributejs";
import format from "prometheus/utils/data/format";
import Icon from "prometheus/utils/ui/priority-icon";
import { inject as service } from "@ember/service";
import $ from 'jquery';

/**
 * This modifier will be called on the initialization of toast ui component to
 * create toast editor and attach tribute to it.
 *
 * @class ToastEditor
 * @namespace Prometheus.Modifiers
 * @extends Modifier
 * @author Rana Nouman <ranamnouman@yahoo.com>
 */
export default class ToastEditor extends Modifier {

  /**
   * PubSub service is used to provide DDAD 
   *
   * @property pubSub
   * @type Ember.Service
   * @private
   */
  @service pubSub;

  /**
   * This function returns list of users 
   *
   * @method get
   * @returns Array
   * @public
   */
  get usersList() {
    return this.args.positional[0];
  }

  /**
   * This function returns issue search function. This function is controlled
   * by the controller (DDAU)
   *
   * @method get
   * @returns Function
   * @public
   */
  get issueSearch() {
    return this.args.positional[1];
  }

  /**
   * This function returns list of translatedEmojis
   *
   * @method get
   * @returns Array
   * @public
   */
  get translatedEmojis() {
    return this.args.positional[2];
  }

  /**
   * This function returns content
   *
   * @method get
   * @returns String
   * @public
   */
  get contents() {
    return this.args.positional[3];
  }

  /**
   * This function returns onContentChange function which will be triggered on
   * when user's content will be changed
   *
   * @method get
   * @returns Function
   * @public
   */
  get onContentChange() {
    return this.args.positional[4];
  }

  /**
   * This function returns editType property which contains
   * user's edit type. Either user want to use WYSIWYG or Markdown
   *
   * @method get
   * @returns String
   * @public
   */
  get editType() {
    return this.args.positional[5];
  }

  /**
   * This function returns hide array which contains the thing the user
   * want to hide from editor
   *
   * @method get
   * @returns Array
   * @public
   */
  get hide() {
    return this.args.positional[6];
  }

  //Called when the modifier is installed on the DOM element
  didInstall() {
    let emojiList = {
      'grinning': '&#128516;',
      'joy': '&#128514;',
      'rolling-on-the-floor-laughing': '&#129315;',
      'smile': '&#128516;',
      'sweat-smile': '&#128517;',
      'laughing': '&#128518;',
      'wink': '&#128521;',
      'blush': '&#128522;',
      'yum': '&#128523;',
      'smiling-face-with-sunglasses': '&#128526;',
      'heart-eyes': '&#128525;',
      'slightly-smiling-face': '&#128578;',
      'thinking-face': '&#129300;',
      'neutral-face': '&#128528;',
      'expressionless': '&#128529;',
      'no-mouth': '&#128566;',
      'face-with-rolling-eyes': '&#128580;',
      'smirk': '	&#128527;',
      'persevere': '&#128547;',
      'disappointed-but-relieved-face': '&#128549;',
      'open-mouth': '&#128558;',
      'zipper-mouth-face': '&#129296;',
      'hushed': '&#128559;',
      'sleepy': '&#128554;',
      'tired-face': '&#128553;',
      'sleeping': '&#128564;',
      'nerd-face': '&#129299;',
      'stuck-out-tongue': '&#128539;',
      'stuck-out-tongue-winking-eye': '&#128540;',
      'drooling-face': '&#129316;',
      'unamused': '&#128530;',
      'sweat': '&#128531;',
      'pensive': '&#128532;',
      'confused': '&#128533;',
      'upside-down-face': '&#128579;',
      'money-mouth-face': '&#129297;',
      'astonished': '&#128562;',
      'slightly-frowning-face': '&#128577;',
      'confounded': '&#128534;',
      'disappointed': '&#128542;',
      'worried': '&#128543;',
      'triumph': '&#128548;',
      'cry': '&#128546;',
      'sob': '&#128557;',
      'frowning-face': '&#9785;&#65039;',
      'fearful': '&#128552;',
      'weary': '&#128553;',
      'grimacing': '&#128556;',
      'cold-sweat': '&#128560;',
      'scream': '&#128561;',
      'dizzy-face': '&#128565;',
      'rage': '&#128545;',
      'angry': '&#128544;',
      'innocent': '&#128519;',
      'face-with-cowboy-hat': '&#129312;',
      'clown-face': '&#129313;',
      'mask': '&#128567;',
      'face-with-thermometer': '&#129298;',
      'face-with-head-bandage': '&#129301;',
      'nauseated-face': '&#129314;',
      'sneezing-face': '&#129319;',
      'smiling-imp': '&#128520;',
      'skull': '&#128128;',
      'alien': '&#128125;',
      'v': '&#9996;&#127995;',
      'hand-with-index-and-middle-fingers-crossed-type-1-2': '&#129310;&#127995;',
      'ok-hand': '&#128076;&#127995;',
      'thumbsup': '&#128077;&#127995;',
      'thumbsdown': '&#128078;&#127995;',
      'clap': '&#128079;&#127995;',
      'zzz': '&#128164;',
      'sunglasses': '&#128374;&#65039;',
      'ant': '&#128028;',
      'hamburger': '&#127828;',
      'pizza': '&#127829;',
      'fries': '&#127839;',
      'popcorn': '&#127871;',
      'coffee': '&#9749;',
      'first-place-medal': '&#129351;',
      'second-place-medal': '&#129352;',
      'third-place-medal': '&#129353;',
      'military-medal': '&#127894;&#65039;',
      'checkered-flag': '&#127937;',
      'skull-and-crossbones': '&#9760;&#65039;',
      'alarm-clock': '&#9200;',
      'watch': '&#8986;',
      'tada': '&#127881;',
      'ribbon': '&#127872;',
      'stopwatch': '&#9201;&#65039;',
      'bulb': '&#128161;',
      'moneybag': '&#128176;',
      'money-with-wings': '&#128184;',
      'date': '&#128197;',
      'chart-with-upwards-trend': '&#128200;',
      'chart-with-downwards-trend': '&#128201;',
      'anger': '&#128162;',
      'no-entry': '&#9940;',
      'no-entry-sign': '&#128683;',
      'radioactive': '&#9762;&#65039;',
      'heavy-check-mark': '&#10004;&#65039;',
      'x': '&#10060;',
      'bangbang': '&#8252;&#65039;',
      'interrobang': '&#8265;&#65039;',
      'question': '&#10067;',
      'exclamation': '&#10071;',
      '100': '&#128175;',
    };

    let _self = this;
    // Initializing tribute object
    _self.tribute = new Tribute({
      collection: [{
        trigger: '@',
        values: _self.usersList,
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
            '<span contenteditable="false" id="@"><a class="badge" href="/app/user/' +
            item.original.value +
            '">@' +
            item.original.label +
            "</a></span>"
          );
        },
        //if we want to match multiple trigger keys, this attribute should be false
      }, {
        trigger: '#',
        values: function (text, cb) {
          remoteSearch(text, cb);
        },
        menuItemTemplate: function (item) {
          return (
            '<a href="/app/project/' +
            item.original.projectId + '/issue/' + item.original.number +
            '">' +
            item.original.number + '-' + item.original.name +
            "</a>"
          );
        },
        selectTemplate: function (item) {
          let icon = new Icon();
          let iconClass = icon.getClass(item.original.priority);
          return (
            '<span class="issue" contenteditable="false" id="#"><a class="' + item.original.status + ' badge"href="/app/project/' +
            item.original.projectId + '/issue/' + item.original.number +
            '"><i class="fa ' + iconClass + '"></i> #' +
            item.original.number + ' - ' + item.original.name +
            "</a></span>"
          );
        },
        lookup: 'number',
      }, {
        trigger: ':',
        values: this.translatedEmojis,
        menuItemTemplate: function (item) {
          return (
            '<a style="cursor:pointer"><span>' + emojiList[item.original.id] + '&#160;' + '</span>' + item.original.name + "</a>"
          );
        },
        selectTemplate: function (item) {
          return (
            '<span>' + emojiList[item.original.id] + '</span>'
          );
        },
        menuItemLimit: 5,
        lookup: 'name',
      }
      ]
    });

    let elementSelectors = {
      toolbar: '.te-toolbar-section',
      footer: '.te-mode-switch-section'
    }
    //Creating Editor object of toastui 
    const editor = new Editor({
      el: _self.element,
      previewStyle: 'vertical',
      initialEditType: _self.editType,
      useDefaultHTMLSanitizer: true,
      events: {
        change: () => {
          _self.onContentChange(editor.getHtml());
        },
        load: () => {
          this.hide.forEach((element) => {
            let selector = elementSelectors[element];
            $(selector).css('display', 'none');
          });
        }
      }
    });

    function remoteSearch(text, cb) {
      var result = _self.issueSearch(text);
      let map = {
        id: 'id',
        name: 'subject',
        number: 'issueNumber',
        status: 'status',
        projectId: 'projectId',
        priority: 'priority'
      };
      result.then(function (data) {
        cb(format.getSelectList(data, map));
      });
    }
    _self.pubSub.on('clearContents', () => {
      editor.reset();
    })
    //Getting element in order to attach tribute to it
    this.targetElement = this.element.querySelector('div.tui-editor-contents.tui-editor-contents-placeholder');
    this.tribute.attach(this.targetElement);

    //Adding an event on opening of menu and after that appyling style and class on 'ul'
    this.targetElement.addEventListener("tribute-active-true", function () {
      let listElement = document.querySelectorAll('div.tribute-container > ul');
      listElement.forEach((list) => {
        list.style.display = "block";
        list.classList.add('dropdown-menu');
      })
    });
    this.element.value = this.contents;
  }

  //Removing tribute from element
  willDestroy() {
    this.tribute.detach(this.targetElement);
  }
}

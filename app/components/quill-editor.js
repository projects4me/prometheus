import Ember from "ember";

/**
  This component is used to render the quill editor in the application.
  @class quill-editor
  @module App.Components
  @namespace Prometheus
  @todo allow passing of the parameters to this component
*/
export default Ember.Component.extend({
   /**
    * Perform some actions after the render is complete
    * @todo perhaps delegate the did render per type
    */
    didRender: function() {
      var self = this;
      if (!(Ember.$('#editor').hasClass('ql-container'))){
        var toolbarOptions = [
          ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
          ['blockquote', 'code-block', 'link','image'],

          [{ 'header': 1 }, { 'header': 2 }],               // custom button values
          [{ 'list': 'ordered'}, { 'list': 'bullet' }],
          [{ 'script': 'sub'}, { 'script': 'super' }],      // superscript/subscript
          [{ 'indent': '-1'}, { 'indent': '+1' }],          // outdent/indent
          [{ 'direction': 'rtl' }],                         // text direction

          [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
          [{ 'header': [1, 2, 3, 4, 5, 6, false] }],

          [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
          [{ 'font': [] }],
          [{ 'align': [] }],

          ['clean']                                         // remove formatting button
        ];

        hljs.configure({   // optionally configure hljs
          languages: ['apache','javascript', 'ruby', 'python','php','java','html','sql','scss','less','json','coffeescript','cpp','go','htmlbars','handlebars','bash']
        });
        var editor = new Quill('#editor', {
          modules: {
            syntax: true,
            toolbar: toolbarOptions,
            //mentions: {},
          },
          theme: 'snow'
        });

/*
        var toolbar = editor.getModule('toolbar');
        toolbar.addHandler('link',function(value){
          if (value) {
            var href = prompt('Enter the URL');
            this.quill.format('link', href);
            } else {
            this.quill.format('link', false);
          }
        });
*/
        editor.on('text-change', function() {

          //Ember.$('#wikiMarkUp').val(Ember.$('#editor .ql-editor').html());
          //Ember.$('#wikiMarkUp').trigger('change');

          /**
            If update is defined as a function then trigger it.
            This is used to let the controller handle anything that it may need
          */
          if (typeof self.update === 'function')
          {
            self.sendAction('update',{'markUp':Ember.$('#editor .ql-editor').html()});
          }

        });



      }
    },

   actions:{
     /**
      * Allowing capture of all possible event and simply forwarding them
      * @params string action delegate the specified event over to the controller
      */
/*     changed:function() {
       Logger.debug('Changed');
       Logger.debug(this);
       this.sendAction('changedsdf');
     }*/
   }
});

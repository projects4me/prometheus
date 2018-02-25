import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | attachment-icon', function() {
  setupComponentTest('attachment-icon', {
    integration: true
  });

  let scenarios = [
      ['text/presentation', '<i class="fa fa-file-powerpoint-o"></i>'],
      ['text/powerpoint', '<i class="fa fa-file-powerpoint-o"></i>'],
      ['text/document', '<i class="fa fa-file-word-o"></i>'],
      ['text/word', '<i class="fa fa-file-word-o"></i>'],
      ['text/excel', '<i class="fa fa-file-excel-o"></i>'],
      ['text/spreadsheet', '<i class="fa fa-file-excel-o"></i>'],
      ['text/pdf', '<i class="fa fa-file-pdf-o"></i>'],
      ['archive/zip', '<i class="fa fa-file-archive-o"></i>'],
      ['archive/tar', '<i class="fa fa-file-archive-o"></i>'],
      ['archive/rar', '<i class="fa fa-file-archive-o"></i>'],
      ['archive/compress', '<i class="fa fa-file-archive-o"></i>'],
      ['audio/mp3', '<i class="fa fa-file-audio-o"></i>'],
      ['application/php', '<i class="fa fa-file-code-o"></i>'],
      ['image/jpeg', '<i class="fa fa-file-image-o"></i>'],
      ['text/html', '<i class="fa fa-file-text-o"></i>'],
      ['video/mpeg', '<i class="fa fa-file-video-o"></i>'],
      ['font/ttf', '<i class="fa fa-font"></i>'],
      ['something/else', '<i class="fa fa-file-o"></i>'],
      ['code/file', '<i class="fa fa-file-o"></i>'],
      ['invalid', ''],
      ['', '']
  ];

  scenarios.forEach(function (scenario) {
      it('renders '+scenario[0], function() {
          this.set('inputValue', scenario[0]);
          this.render(hbs`{{attachment-icon mime=inputValue}}`);
          expect(this.$('.attachment-icon').html().trim()).to.equal(scenario[1]);
      });
  });

});


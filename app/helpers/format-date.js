import { helper } from '@ember/component/helper';

export default helper(function formatDate(positional, { actualFormat, expectedFormat }) {
  if (positional[0]) {
    return luxon.DateTime.fromFormat(positional[0], actualFormat).toFormat(expectedFormat);
  }
});

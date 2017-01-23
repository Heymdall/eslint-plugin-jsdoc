import _ from 'lodash';
import iterateJsdoc from '../iterateJsdoc';

const extractParagraphs = (text) => {
  return text.split(/\n\n/);
};

const isNewLinePrecededByAPeriod = (text) => {
  let lastLineEndsSentence;

  const lines = text.split('\n');

  return !_.some(lines, (line) => {
    if (_.isBoolean(lastLineEndsSentence) && !lastLineEndsSentence && line[0].toLocaleUpperCase() === line[0]) {
      return true;
    }

    lastLineEndsSentence = /\.$/.test(line);

    return false;
  });
};

const validateDescription = (description, report) => {
  if (!description) {
    return false;
  }

  const paragraphs = extractParagraphs(description);

  return _.some(paragraphs, (paragraph, index) => {
    if (paragraph[0].toLocaleUpperCase() !== paragraph[0]) {
      if (index === 0) {
        report('Description must start with an uppercase character.');
      } else {
        report('Paragraph must start with an uppercase character.');
      }

      return true;
    }

    if (!/\.$/.test(paragraph)) {
      report('Sentence must end with a period.');

      return true;
    }

    if (!isNewLinePrecededByAPeriod(paragraph)) {
      report('A line of text is started with an uppercase character, but preceding line does not end the sentence.');

      return true;
    }

    return false;
  });
};

export default iterateJsdoc(({
  jsdoc,
  report
}) => {
  if (validateDescription(jsdoc.description, report)) {
    return;
  }

  const tags = _.filter(jsdoc.tags, (tag) => {
    return _.includes(['param', 'returns'], tag.tag);
  });

  _.some(tags, (tag) => {
    const description = _.trimStart(tag.description, '- ');

    return validateDescription(description, report);
  });
});

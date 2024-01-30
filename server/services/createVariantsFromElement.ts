import db from '../models';

async function createVariantsFromElement({ element, experimentId }) {
  const { properties } = element;
  const innerText = properties.innerText;

  const variants = await db.Variant.bulkCreate([
    {
      experiment_id: experimentId,
      color: properties.color,
      background_color: properties.backgroundColor,
      font_size: properties.fontSize,
      text: innerText,
      is_control: true,
      traffic: 34,
    },
    {
      experiment_id: experimentId,
      color: properties.color,
      background_color: properties.backgroundColor,
      font_size: properties.fontSize,
      text: innerText + ' Variant',
      is_control: false,
      traffic: 33,
    },
    {
      experiment_id: experimentId,
      color: properties.color,
      background_color: properties.backgroundColor,
      font_size: properties.fontSize,
      text: innerText + ' Variant 2',
      is_control: false,
      traffic: 33,
    },
  ]);

  return variants;
}

export default createVariantsFromElement;

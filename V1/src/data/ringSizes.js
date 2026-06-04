export const ringSizes = {
  US: [
    '3', '3.5', '4', '4.5', '5', '5.5', '6', '6.5', '7', '7.5',
    '8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5', '12', '12.5', '13', '13.5', '14',
  ],
  UK: [
    'F', 'G', 'G½', 'H½', 'I½', 'J½', 'K½', 'L', 'M', 'N',
    'O½', 'P½', 'Q½', 'R½', 'S½', 'T½', 'U½', 'V½', 'W½', 'X½', 'Y½', 'Z+1', 'Z+2',
  ],
  EU: [
    '44', '45.5', '46.75', '48', '49.25', '50.5', '51.75', '53', '54', '55.25',
    '56.5', '57.75', '59', '60.25', '61.5', '62.75', '64', '65', '66.25', '67.5', '68.75', '70', '71.25',
  ],
};

export function convertSize(value, fromSystem, toSystem) {
  if (!value || fromSystem === toSystem) return value;
  const fromList = ringSizes[fromSystem];
  const toList = ringSizes[toSystem];
  if (!fromList || !toList) return '';
  const idx = fromList.indexOf(value);
  if (idx === -1) return '';
  return toList[idx] || '';
}

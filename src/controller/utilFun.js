export const excapeMarkupV2 = (text) => {
  return text.replace(/([_*[\]()~`>#+\-=|{}.!])/g, "\\$1");
};

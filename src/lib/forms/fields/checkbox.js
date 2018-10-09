const factory = (name, opts = {}, value) => {
  const defaults = {
    label: '',
    widget: 'checkbox'
  };
  const options = {
    ...defaults,
    ...opts
  };
  return {
    name,
    value,
    options,
    errors: []
  };
};

module.exports = factory;

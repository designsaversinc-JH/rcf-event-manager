const buildResponse = (data, message = 'success', meta = {}) => ({
  message,
  data,
  meta,
});

module.exports = {
  buildResponse,
};

exports.stringify = function (data) {
  return Object.entries(data)
    .map(([key, val]) => (Array.isArray(val) ? `${key}=[${val}]` : `${key}=${val}`))
    .join('&');
};

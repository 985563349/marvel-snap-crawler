exports.stringify = (data) => {
  return Object.entries(data)
    .map(([key, val]) => (Array.isArray(val) ? `${key}=[${val}]` : `${key}=${val}`))
    .join('&');
};

exports.sleep = (ms) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

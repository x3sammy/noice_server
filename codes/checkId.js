const checkId = (id) => {
  const reg = /^\d{1,15}$/;
  const is_match = id.search(reg);
  if (is_match == 0) {
    return true;
  } else {
    return false;
  }
};

export default checkId;

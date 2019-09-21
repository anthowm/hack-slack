module.exports = {
  stringGen(len) {
    var text = "";
    var charset = "ABCDEFGHIJKLMNOPRSTUV";

    for (var i = 0; i < len; i++)
      text += charset.charAt(Math.floor(Math.random() * charset.length));

    return text.toLowerCase();
  },
  getOneRandomLetter() {
    return this.stringGen(1);
  }
};

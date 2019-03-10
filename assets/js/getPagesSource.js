function getUnique(arr, comp) {
  const unique = arr
    .map(e => e[comp])

    // store the keys of the unique objects
    .map((e, i, final) => final.indexOf(e) === i && i)

    // eliminate the dead keys & store unique objects
    .filter(e => arr[e])
    .map(e => arr[e]);

  return unique;
}

DOMtoString = document_root => {
  var html = "",
    node = document_root.firstChild;
  while (node) {
    switch (node.nodeType) {
      case Node.ELEMENT_NODE:
        html += node.outerHTML;
        break;
      case Node.TEXT_NODE:
        html += node.nodeValue;
        break;
      case Node.CDATA_SECTION_NODE:
        html += "<![CDATA[" + node.nodeValue + "]]>";
        break;
      case Node.COMMENT_NODE:
        html += "<!--" + node.nodeValue + "-->";
        break;
      case Node.DOCUMENT_TYPE_NODE:
        html +=
          "<!DOCTYPE " +
          node.name +
          (node.publicId ? ' PUBLIC "' + node.publicId + '"' : "") +
          (!node.publicId && node.systemId ? " SYSTEM" : "") +
          (node.systemId ? ' "' + node.systemId + '"' : "") +
          ">\n";
        break;
    }
    node = node.nextSibling;
  }
  return html;
};

isMagnet = ({ exact = false } = {}) => {
  return exact
    ? /^magnet:\?xt=urn:[a-z0-9]+:[a-z0-9]{32,40}&dn=.+&tr=.+$/i
    : /magnet:\?xt=urn:[a-z0-9]+:[a-z0-9]{32,40}&dn=.+&tr=.+/gi;
};

getMagnetTitle = magnetString => {
  let start = magnetString.lastIndexOf("&dn=");
  let end = magnetString.indexOf("&tr=");

  return magnetString.slice(start + 4, end);
};

getMagnets = document => {
  let htmlContent = DOMtoString(document);
  let decoded = htmlContent.replace(/&amp;/g, "&");

  const pattern = isMagnet({ exact: true });
  const regexr = new RegExp(pattern);

  let matches = [];

  // Get occurences from string
  decoded.replace(isMagnet({ exact: false }), (m, p1) => {
    if (!matches.includes(m)) matches.push(m);
  });

  // Iterate over matches and sanitize them!
  matches = matches.map(match => {
    let magnet;

    match = match.replace(/<\/?[^>]+(>|$)/g, "");

    if (match.includes('"')) {
      magnet = match.split('"')[0];
    }

    magnet = regexr.test(magnet) === true ? magnet : match;

    return {
      magnet,
      title: decodeURI(getMagnetTitle(magnet))
    };
  });

  return getUnique(matches, "magnet");
};

generateMagnets = rawDocument => {
  return JSON.stringify(getMagnets(rawDocument));
};

chrome.runtime.sendMessage({
  action: "getSource",
  results: generateMagnets(document)
});

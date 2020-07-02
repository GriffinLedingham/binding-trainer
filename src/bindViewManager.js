class BindViewManager {
  constructor(wowClass, stats) {
    this.wowClass = wowClass
    this.stats = stats
    this.binds = {}
    this.setupSelectors(wowClass.getSelectors());

    const pastBinds = localStorage.getItem('binds')
    const pastBindsObj = JSON.parse(pastBinds)
    for(let i in pastBindsObj) {
      this.addSpellToKey(i, pastBindsObj[i])
      $(`.spell-selector[data-keyid=${i}]`).val(pastBindsObj[i])
    }
  }

  addSpellToKey(key, spellId) {
    if(spellId == 'No Spell') {
      $(`.key[data-keyid="${key}"]`).html(key.toUpperCase())
      delete this.binds[key]
      this.saveBinds()
      return
    }
    const index = Math.round(Math.random() * 100);
    const temp = `
      <div class="spellItem" data-spellid="${spellId}" data-index="${index}">
        <div class="itemThumbWrapper">
          <div class="itemThumbWrapperGloss" onmouseover="window.bindTrainer.hoverItem('${spellId}${index}');" onmouseout="window.bindTrainer.hoverItem('${spellId}${index}');"></div>
          <div id="thumb${spellId}${index}" class="gearItemThumb" ></div>
        </div>
        <div id="${spellId}${index}" class="spellItemTooltip"></div>
      </div>`;
    $(`.key[data-keyid="${key}"]`).html(temp);
    this.processSpells(key);
    this.binds[key] = spellId
    this.saveBinds()
  }

  saveBinds() {
    localStorage.setItem('binds', JSON.stringify(this.binds))
  }

  updateStats() {
    $('#count').text(this.stats.spells)
    $('#errors').text(this.stats.errors)
    $('#sps').text(this.stats.sps)
    $('#acc').text(Math.min(100* this.stats.accuracy, 100) + '%')
  }

  processSpells(keyId) {
    const spells = document.querySelectorAll(
      `.key[data-keyid="${keyId}"] .spellItem`
    );
    Array.prototype.forEach.call(spells, (e, index) => {
      const spellId = e.getAttribute("data-spellid");
      const spellIndex = e.getAttribute("data-index");
      jsonp("https://www.wowdb.com/spells/" + spellId + "/tooltip", data => {
        const img = data.Tooltip.match(/src=\"(.+)\.jpg/);
        if (img != null) {
          document.getElementById("thumb" + spellId + spellIndex).innerHTML =
            '<img src="' + img[1] + '.jpg" />';
        }
        document.getElementById(spellId + spellIndex).innerHTML = data.Tooltip;
      });
    });
  }

  setupSelectors(selectors) {
    const keys = [1,2,3,4,5,"q", "w", "e", "r", "t", "a", "s", "d", "f", "g", "z","x","c","v","b"]
    for (let i in keys) {
      const letter = keys[i];
      const temp = `
        <div>
          ${letter}:
          <select class="spell-selector" data-keyid="${letter}">
            <option>No Spell</option>
            ${Object.keys(selectors).map(function (key) {
              return "<option value='" + key + "'>" + selectors[key] + "</option>"
            }).join("")}
          </select>
        </div>`;
      $("#selectors").append(temp);
    }
  }
}

function jsonp(url, callback) {
  const callbackName = "jsonp_callback_" + Math.round(100000 * Math.random());
  window[callbackName] = (data) => {
    delete window[callbackName];
    document.body.removeChild(script);
    callback(data);
  };

  const script = document.createElement("script");
  script.src =
    url + (url.indexOf("?") >= 0 ? "&" : "?") + "callback=" + callbackName;
  document.body.appendChild(script);
}

export { BindViewManager };

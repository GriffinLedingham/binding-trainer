import { BindViewManager } from "/src/bindViewManager.js";
import { Paladin } from '/src/classes/paladin.js'
window.Paladin = Paladin
import { Shaman } from '/src/classes/shaman.js'
window.Shaman = Shaman

class BindTrainer {
  constructor() {
    this.stats = {
      spells: 0,
      accuracy: 100,
      sps: 0,
      errors: 0
    }

    const className = localStorage.getItem('class') || 'Paladin'
    this.wowClass = new window[className]()

    this.bindViewManager = new BindViewManager(this.wowClass, this.stats);

    this.keydowns = {};

    this.goalQueue = []

    this.setupBindings();

    this.loopTimeout = null;

    this.spellDown = null;

    this.timings = [];
  }

  changeClass() {
    this.stats = {
      spells: 0,
      accuracy: 100,
      sps: 0,
      errors: 0
    }

    const className = localStorage.getItem('class') || 'Paladin'
    this.wowClass = new window[className]()

    this.bindViewManager = new BindViewManager(this.wowClass, this.stats);

    this.keydowns = {};

    this.goalQueue = []

    this.loopTimeout = null;

    this.spellDown = null;

    this.timings = [];
  }

  startGameLoop() {
    this.startTs = +new Date()
    this.spellTimer = +new Date()

    this.goalQueue = []
    this.timings = [];

    $('#queue').html('')

    this.stats.spells = 0
    this.stats.accuracy = 100
    this.stats.sps = 0
    this.stats.error = 0

    this.bindViewManager.updateStats()
    this.queueGameLoop()
  }

  stopGameLoop() {
    clearTimeout(this.loopTimeout)
  }

  queueGameLoop() {
    this.loopTimeout = setTimeout(() => {
      this.gameLoop()
      this.queueGameLoop()
    }, $('#speed').val())
  }

  gameLoop() {
    this.addSpellToQueue(getRandomItem(Object.keys(this.wowClass.getSelectors())))

    this.stats.accuracy = this.stats.spells / (this.stats.spells + this.stats.errors)
    this.stats.sps = this.stats.spells / ((+new Date() - this.startTs) / 1000)

    this.bindViewManager.updateStats()
  }

  addSpellToQueue(spellid) {
    try {
      let el = $(`.spellItem[data-spellid=${spellid}] img`)
      $('#queue').append(`<img style="border-radius:10px;margin-bottom:10px;" src="${el[0].src}" />`)
      if(this.goalQueue.length == 0) this.spellTimer = +new Date()
      this.goalQueue.push({id: spellid, name: this.wowClass.getSelectors()[spellid]})
    } catch(e) {

    }
  }

  castSpell() {
    if(this.goalQueue[0].name == this.spellDown) {
      this.stats.spells++
      this.goalQueue.shift()
      this.spellDown = null
      $('#queue img').first().remove()
      this.timings.push(+new Date() - this.spellTimer)
      this.spellTimer = null
      if(this.goalQueue.length > 0) this.spellTimer = +new Date()
    } else {
      this.stats.errors++
    }

    this.stats.accuracy = this.stats.spells / (this.stats.spells + this.stats.errors)
    this.stats.sps = this.stats.spells / ((+new Date() - this.startTs) / 1000)

    $('#reac').text(Math.round((this.timings.reduce((a, b) => a + b, 0))/this.stats.spells) + 'ms')
    this.bindViewManager.updateStats()
  }

  setupBindings() {
    $("body").on("keydown", (e) => this.keyDownEvent(e));
    $("body").on("keyup", (e) => this.keyUpEvent(e));
    $(document).on("change", ".spell-selector", (e) =>
      this.spellSelectorChange(e)
    );
    $(document).on("click", "#start", (e) =>
      this.startGameLoop()
    );
    $(document).on("click", "#stop", (e) =>
      this.stopGameLoop()
    );
    $(document).on('change', "#speed", (e) => {
      $('#speed_label').text($('#speed').val() + 'ms')
    })
    $(document).on('click', ".change-class", (e) => {
      localStorage.setItem('class', $(e.currentTarget).data('class'))
      location.reload()
    })
  }

  spellSelectorChange(e) {
    let el = $(e.currentTarget);
    var keyid = el.data("keyid");
    this.bindViewManager.addSpellToKey(keyid, el.val());
    this.bindViewManager.processSpells(keyid);
  }

  keyDownEvent(e) {
    let keynum;

    if (window.event) keynum = e.keyCode;
    else if (e.which) keynum = e.which;

    if (this.keydowns[keynum] != false && this.keydowns[keynum] != undefined)
      return;
    this.keydowns[keynum] = true;

    let selector = `.key[data-keyid="${String.fromCharCode(
      keynum
    ).toLowerCase()}"]`;
    this.setKeyPressedStyle(selector);

    let el = $(selector);
    if (el.find(".tooltip-table").length > 0) {
      this.spellDown = el.find(".tooltip-table h2").text()
      this.castSpell()
    }
    else console.log(String.fromCharCode(keynum));
  }

  keyUpEvent(e) {
    let keynum;

    if (window.event) keynum = e.keyCode;
    else if (e.which) keynum = e.which;

    if (this.keydowns[keynum] != false) this.keydowns[keynum] = false;

    this.clearKeyStyle(
      `.key[data-keyid="${String.fromCharCode(keynum).toLowerCase()}"]`
    );
  }

  setKeyPressedStyle(selector) {
    let el = $(selector);
    el.css("background", "red");
  }

  clearKeyStyle(selector) {
    let el = $(selector);
    el.css("background", "white");
  }

  hoverItem(id) {
    document.getElementById(id).classList.toggle("show");
  }
}

function getRandomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function getValues(obj) {
  return Object.keys(obj).map(function(key){return obj[key]})
}

export { BindTrainer };

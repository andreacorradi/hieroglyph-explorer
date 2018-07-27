(function() {
  'use strict'
  window.APP = window.APP || {}
  APP.glyphs = []
  let gardCat = "A"
  const categories = {
    "Man and his occupations": "A",
    "Woman and her occupations": "B",
    "Anthropomorphic deities": "C",
    "Parts of the human body": "D",
    "Mammals": "E",
    "Parts of mammals": "F",
    "Birds": "G",
    "Parts of birds": "H",
    "Amphibious animals, reptiles, etc.": "I",
    "Fish and parts of fish": "K",
    "Invertebrates and lesser animals": "L",
    "Trees and plants": "M",
    "Sky, earth, water": "N",
    "Buildings, parts of buildings, etc.": "O",
    "Ships and parts of ships": "P",
    "Domestics and funerary furniture": "Q",
    "Temple furniture and sacred emblems": "R",
    "Crowns, dress, staves, etc.": "S",
    "Warfare, hunting, and butchery": "T",
    "Agriculture, crafts, and professions": "U",
    "Rope, fiber, baskets, bags, etc.": "V",
    "Vessels of stone and earthenware": "W",
    "Loaves and cakes": "X",
    "Writings, games, music": "Y",
    "Strokes, signs derived from Hieratic, geometrical figures": "Z",
    "Unclassified": "Aa"
  }

  APP.utilities = new Utilities() || APP.utilities
  APP.parser = new Parser() || APP.parser

  function init() {
    APP.parser.buildDictionary()
    //populate category select
    _.forOwn(categories, function(c, key) {
      let el = '<option>' + key + '</option>'
      $('select#cat-selector').append(el)
    })
    run()
  }
  
  init()

  function run() {
    //category select event listener
    $('select#cat-selector').change(function(e){
      gardCat = categories[$(this).val()]
      //first remove old categories
      $('select#item-selector option').remove()
      //pick items belonging to the chosen category
      let items = _.filter(APP.glyphs, function(g) { 
        if (gardCat !== "Aa") {
          return g.id.slice(0, 1) === gardCat && g.id.slice(0, 2) !== "Aa"
        } else return g.id.slice(0, 2) === gardCat
      })
      //populate item select
      _.forOwn(items, function(i, key) {
        let index
        if (gardCat !== "Aa") { index = i.id.slice(1) } else index = i.id.slice(2)
        let el = '<option id="item' + index +'">' + i.description + '</option>'
        $('select#item-selector').append(el)
      })
      //init item select, first item of the category as default
      let itemValue = gardCat + "1"
      displayHieroglyph(itemValue)
    })
    //item select event listener
    $('select#item-selector').change(function(e){
      let itemValue = gardCat + $(this).find('option:selected').attr('id').slice(4)
      displayHieroglyph(itemValue)
    })
  }

  //picks and displays the hieroglyph associated with itemId 
  function displayHieroglyph(itemId) {
    let hierogliph = APP.utilities.match(APP.glyphs, itemId)
    if (hierogliph.attr("code") !== undefined) {
      let hieroCode = hierogliph.attr("code").slice(2)
      let hieroDesc = hierogliph.attr("description")
      $('.pictogram').html('&#x' + hieroCode + ';')
      $('.description').html(hieroDesc)
    } else {
      $('.pictogram').html('')
      $('.description').html('Code not existent')
    }
    let hieroInfo = hierogliph.attr("uses")
    displayInfo(hieroInfo)
  }

  function displayInfo(info) {
    $('.use > ul > li').remove()
    info.forEach(function(h) {
      var el1 = '<li class="item">' + h.name + '</li>'
      var el2 = '<li class="item">' + pickContext(h.desc, h.std) + '</li>'
      var el3 = '<li class="item">' + pickExamples(h.desc, h.std) + '</li>'
      $('section#info .label ul').append(el1)
      $('section#info .context ul').append(el2)
      $('section#info .examples ul').append(el3)
    })

    function pickContext(desc, std) {
      let genString = ''
      if (desc !== null) {
        genString = desc.descName
      } else if (std !== null) {
        genString = std.stdName
      } else genString = '—'
      return genString
    }

    function pickExamples(desc, std) {
      let genString = ''
      if (desc !== null) {
        if (desc.descExamples.length !== 0) {
          desc.descExamples.forEach(function(e, i) {
            genString += e
            if (i !== desc.descExamples.length - 1) genString += ', '
          })
        }
      } else if (std !== null) {
        if (std.stdExamples.length !== 0) {
          std.stdExamples.forEach(function(e, i) {
            genString += e
            if (i !== std.stdExamples.length - 1) genString += ', '
          })
        } else genString = '—'
      } else genString = '—'
      return genString
    }

  }
  
})()
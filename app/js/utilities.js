function Utilities() {
	self = this

	self.match = function(arr, prop) {
    let el = _.find(arr, function(p) { return p.id === prop })
    return $(el)
  }

  self.matchMult = function (arr, prop) {
    let filteredArr = _.filter(arr, function(p) { return p.id === prop })
    return filteredArr
  }

  return self
}
